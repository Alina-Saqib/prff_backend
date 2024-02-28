import {Request, Response} from 'express';
import sendEmail from '../utility/nodemailer';
import emailSchema from '../model/emailSchema';
import cron from 'node-cron';
import { Op } from 'sequelize';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid'; 


AWS.config.update({
  accessKeyId: 'AKIAZKCIK6S7TUPOBUXZ',
  secretAccessKey: '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',
  
});

const s3 = new AWS.S3();



export const adminEmailSend = async (req: Request, res: Response) => {
  try {
    const { toEmails, subject, emailContent, scheduledTime, frequency } = req.body;
    const toEmailsArray = JSON.parse(toEmails)
    const toEmailsString = toEmailsArray.join(',')
  
    
    let attachmentLinks: string[] =[];

    if (req.files) {
    await handleFileUploads(req, attachmentLinks); 
    }
    
    const attachments = Object.values(req.files as any).map((file: any) => {
      return {
        filename: file.originalname,
    content: file.buffer, 
    encoding: '7bit', 
    contentType: file.mimetype
      };
    });

    if (scheduledTime && frequency) {

      const newSave = await emailSchema.create({
        toEmails:toEmailsString,
        subject,
        emailContent,
        scheduledTime,
        frequency,
        attachments: attachmentLinks.join(',') === '' ? attachmentLinks.join(','): null,
        emailStatus: "Recurring"
      });

      if (newSave) {
        res.status(200).json({ message: `Recurring Email set for ${scheduledTime} and frequency ${frequency}` });
      } else {
        throw new Error('Failed to schedule recurring emails');
      }
    
    }else if(scheduledTime){
      const newSave = await emailSchema.create({
        toEmails:toEmailsString,
        subject,
        emailContent,
        scheduledTime,
        frequency,
        attachments:attachmentLinks.join(',') === '' ? attachmentLinks.join(','): null,
        emailStatus: "Scheduled"
      });

      if (newSave) {
        res.status(200).json({ message: `Email scheduled for ${scheduledTime}` });
      } else {
        throw new Error('Failed to schedule email');
      }
      


    } else {
      await sendEmail(toEmailsArray, subject, emailContent, attachments);
      const instantEmailSave = await emailSchema.create({
        toEmails:toEmailsString,
        subject,
        emailContent,
        scheduledTime,
        frequency,
        attachments: attachmentLinks.join(',') === '' ? attachmentLinks.join(','): null,
        emailStatus: "Sent"
      });

      if (instantEmailSave) {
        res.status(200).json({ message: 'Email sent Successfully' });
      } else {
        throw new Error('Failed to send email');
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const handleFileUploads = async (req: Request, attachmentLinks: string[]) => {
  try {
    

    const files: any = req.files;

    for (const file of files) {
      const attachmentLink = await uploadToS3(file);
      attachmentLinks.push(attachmentLink);
    }

   
  } catch (err) {
    console.error(err);
    throw new Error('Error handling file uploads');
  }
};

const uploadToS3 = async (file: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const attachmentKey = `attachments/${uuidv4()}_${file.originalname}`;

    const params = {
      Bucket: 'email-attach-files',
      Key: attachmentKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    s3.upload(params, (err: any, data: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Location); 
      }
    });
  });
};

export const scheduleEmails = () => {

    cron.schedule('* * * * *', async () => {
      try {
        const currentTime = new Date().getTime();
        const scheduledEmails = await emailSchema.findAll({
          where: {
            scheduledTime: {
              [Op.lt]: new Date(currentTime), 
            },
            emailStatus: 'Scheduled',
          },
        });
        
        for (const email of scheduledEmails) {
          const attachments: any[] = []; 
         if(email.attachments !== null )
        {  const attachmentLinks = email.attachments.split(',');
  
          
          for (const attachmentLink of attachmentLinks) {
            const {filename,data}: any = await downloadFromS3(attachmentLink);
          
            attachments.push({
              filename: filename, 
              content: data.Body,
              contentType: data.ContentType,
              encoding: '7bit', 
            });
          }}
          await sendEmail(email.toEmails, email.subject, email.emailContent,attachments);
          email.emailStatus = 'Sent';
          await email.save();
        }
      } catch (error) {
        console.error('Error processing scheduled emails:', error);
      }
    });
  };

  const downloadFromS3 = async (attachmentLink: string):  Promise<{ filename: string; data: Buffer; }> => {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: 'email-attach-files',
        Key: attachmentLink.replace('https://email-attach-files.s3.amazonaws.com/', ''),
      };
  
      s3.getObject(params, (err: any, data: any) => {
        if (err) {
          console.error('Error downloading from S3:', err);
          reject(err);
        } else {
          const filename= attachmentLink.split('/').pop() || 'attachment.txt';
          resolve({ filename,data}); 
        }
      });
    });
  };

  export const RecurringEmails = () => {

    cron.schedule('* * * * *', async () => {
      try {
        const currentTime = new Date().getTime();
        const scheduledEmails = await emailSchema.findAll({
          where: {
            scheduledTime: {
              [Op.lt]: new Date(currentTime), 
            },
            emailStatus: 'Recurring',
          },
        });
  
        
        for (const email of scheduledEmails) {

          if(email.frequency === 'daily'){
            const nextDay = new Date(email.scheduledTime);
            nextDay.setDate(nextDay.getDate() + 1);
            email.scheduledTime = nextDay;

          }else if(email.frequency === 'weekly' ){
            const nextWeek = new Date(email.scheduledTime);
            nextWeek.setDate(nextWeek.getDate() + 7);
            email.scheduledTime = nextWeek;

          }else if(email.frequency === 'monthly') {
            const nextMonth = new Date(email.scheduledTime);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            email.scheduledTime = nextMonth;

          }
          const attachments: any[] = []; 
          if(email.attachments !== null )
         {  const attachmentLinks = email.attachments.split(',');
   
           
           for (const attachmentLink of attachmentLinks) {
             const {filename,data}: any = await downloadFromS3(attachmentLink);
           
             attachments.push({
               filename: filename, 
               content: data.Body,
               contentType: data.ContentType,
               encoding: '7bit', 
             });
           }}
          await sendEmail(email.toEmails, email.subject, email.emailContent,attachments);
          await email.save();
        }
      } catch (error) {
        console.error('Error processing scheduled emails:', error);
      }
    });
  };


  export const getEmails = async(req: Request, res: Response) =>{

    try {
      const allEmails = await emailSchema.findAll();
      if(allEmails  && allEmails.length >0){

        return res.status(200).json({allEmails});
      }
      return res.status(400).json({message:"no Email found"})
      
    } catch (error) {
      return res.status(500).json({error:"Server Error"})
    }


  } 


  export const getEmailsById = async(req: Request, res: Response) =>{

    const { id } = req.params;
    try {
      const email = await emailSchema.findByPk(id);
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }
      return res.status(200).json({ email });
      
    } catch (error) {
      return res.status(500).json({error:"Server Error"})
    }

    
  }

  export const deleteEmails = async(req: Request, res: Response) =>{
    const {id} = req.params;

    try {
      const email = await emailSchema.findByPk(id);
      if (!email) {
        return res.status(404).json({ error: 'Email not found' });
      }
      await email.destroy();
      return res.status(200).json({message:"Successfully deleted email"})
  
      
    } catch (error) {
      return res.status(500).json({error:"Server Error"})
      
    }

    
  }