import nodemailer from 'nodemailer';

const sendEmail = async (email: string, subject: string, text: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      service: 'Gmail',
      secure: true,
      auth: {
        user: 'verify.pruuf@gmail.com',
        pass: 'nmatvrxsyqoklkdv',
      },
    });

    await transporter.sendMail({
      from: 'verify.pruuf@gmail.com',
      to: email,
      subject: subject,
      text: text,
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Email not sent");
    console.error(error);
  }
};

export default sendEmail;
