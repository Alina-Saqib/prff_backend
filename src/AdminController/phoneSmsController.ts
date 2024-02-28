import {Request,Response} from 'express'
import { phoneSms } from '../utility/phoneSms';
import phoneSchema from '../model/phoneSchema';
import cron from 'node-cron';
import { Op } from 'sequelize';


export const sendSms = async (req: Request, res: Response) => {
    const { text, phoneNumber, scheduledTime, frequency } = req.body;

    if (!text || !phoneNumber || phoneNumber.length === 0) {
        res.status(400).json({ message: "Phone Number and Text are required" });
        return;
    }

    try {
        if (scheduledTime && frequency) {
            const results = [];
            for (let i = 0; i < phoneNumber.length; i++) {
                const number = phoneNumber[i];
                const result = await phoneSchema.create({
                    phoneNumber: number,
                    text,
                    scheduledTime,
                    frequency,
                    smsStatus: "Recurring"
                });
                results.push(result);
            }

            if (results.length === phoneNumber.length) {
                res.status(200).json({ message: `Recurring Sms set for ${scheduledTime} and frequency ${frequency}` });
            } else {
                throw new Error('Failed to schedule recurring sms');
            }
        } else if (scheduledTime) {
            const results = [];
            for (let i = 0; i < phoneNumber.length; i++) {
                const number = phoneNumber[i];
                const result = await phoneSchema.create({
                    phoneNumber: number,
                    text,
                    scheduledTime,
                    frequency,
                    smsStatus: "Scheduled"
                });
                results.push(result);
            }

            if (results.length === phoneNumber.length) {
                res.status(200).json({ message: `Sms scheduled for ${scheduledTime}` });
            } else {
                throw new Error('Failed to schedule sms');
            }
        } else {
            const results = [];
            for (let i = 0; i < phoneNumber.length; i++) {
                const number = phoneNumber[i];
                const smsSuccess = await phoneSms(text, number);
                const result = await phoneSchema.create({
                    phoneNumber: number,
                    text,
                    scheduledTime,
                    frequency,
                    smsStatus: smsSuccess ? "Sent" : "Failed"
                });
                results.push(result);
            }

            if (results.length === phoneNumber.length) {
                res.status(200).json({ message: "Message sent successfully" });
            } else {
                throw new Error('Failed to send sms');
            }
        }

    } catch (err) {
        res.status(500).json({ error: "Error sending message" });
    }
};


  export const scheduleSms = () => {

    cron.schedule('* * * * *', async () => {
      try {
        const currentTime = new Date().getTime();
        const scheduledSms = await phoneSchema.findAll({
          where: {
            scheduledTime: {
              [Op.lte]: new Date(currentTime), 
            },
            smsStatus: 'Scheduled',
          },
        });
        
        for (const sms of scheduledSms) {
            const smsSuccess = await phoneSms(sms.text, sms.phoneNumber);
            if( smsSuccess )
            { sms.smsStatus = 'Sent';
             await sms.save();}
           }

        
      
      } catch (error) {
        console.error('Error processing scheduled sms:', error);
      }
    });
  };

  

export const RecurringSms = () => {

    cron.schedule('* * * * *', async () => {
      try {
        const currentTime = new Date().getTime();
        const allsms = await phoneSchema.findAll({
          where: {
            scheduledTime: {
              [Op.lte]: new Date(currentTime), 
            },
            smsStatus: 'Recurring',
          },
        });
  
        
        for (const sms of allsms) {

          if(sms.frequency === 'daily'){
            const nextDay = new Date(sms.scheduledTime);
            nextDay.setDate(nextDay.getDate() + 1);
            sms.scheduledTime = nextDay;

          }else if(sms.frequency === 'weekly' ){
            const nextWeek = new Date(sms.scheduledTime);
            nextWeek.setDate(nextWeek.getDate() + 7);
            sms.scheduledTime = nextWeek;

          }else if(sms.frequency === 'monthly') {
            const nextMonth = new Date(sms.scheduledTime);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            sms.scheduledTime = nextMonth;

          }
       

          const success = await phoneSms(sms.text, sms.phoneNumber);
          if(success)
        {  await sms.save();}
        }
      } catch (error) {
        console.error('Error processing Recurring sms:', error);
      }
    });
  };

  export const getSMS = async(req: Request, res: Response) =>{

    try {
      const allSMS = await phoneSchema.findAll();
      if(allSMS  && allSMS.length >0){

        return res.status(200).json(allSMS);
      }
      return res.status(400).json({message:"no SMS record found"})
      
    } catch (error) {
      return res.status(500).json({error:"Server Error"})
    }


  } 


  export const getSMSById = async(req: Request, res: Response) =>{

    const { id } = req.params;
    try {
      const sms = await phoneSchema.findByPk(id);
      if (!sms) {
        return res.status(404).json({ error: 'SMS Record not found' });
      }
      return res.status(200).json(sms);
      
    } catch (error) {
      return res.status(500).json({error:"Server Error"})
    }

    
  }

  export const deleteSMS = async(req: Request, res: Response) =>{
    const {id} = req.params;

    try {
      const sms = await phoneSchema.findByPk(id);
      if (!sms) {
        return res.status(404).json({ error: 'SMS not found' });
      }
      await sms.destroy();
      return res.status(200).json({message:"Successfully deleted sms"})
  
      
    } catch (error) {
      return res.status(500).json({error:"Server Error"})
      
    }

    
  }