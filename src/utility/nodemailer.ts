import nodemailer from 'nodemailer';

const sendEmail = async (email: string, subject: string, text: string, attachments: any) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      service: 'Gmail',
      secure: true,
      auth: {
        // user: 'verify.pruuf@gmail.com',
        // pass: 'nmatvrxsyqoklkdv',
        user:'pruuf.verify@gmail.com',
        pass:'oodsvutevhfelzlf'
      },
    });

   
    await transporter.sendMail({
      // from: 'verify.pruuf@gmail.com',
      from:'pruuf.verify@gmail.com',
      to: email,
      subject: subject,
      html: text,
      attachments: attachments.length > 0 ? attachments : undefined
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email not sent");
    console.error(error);
  }
};

export default sendEmail;
