import nodemailer from 'nodemailer';

export const sendRequestEmail = async (providerEmail: string, requestDetails: any) => {
    const subject = 'New Service Request Received';
    // const acceptLink = `http://yourwebsite.com/accept?requestId=${requestDetails.id}`;
    // const rejectLink = `http://yourwebsite.com/reject?requestId=${requestDetails.id}`;

    const emailHTML = `
      <p>Dear Service Provider,</p>
      <p>You have received a new service request. Here are the details:</p>
      <ul>
        <li>Category: ${requestDetails.category}</li>
        <li>Service: ${requestDetails.service}</li>
        <li>Description: ${requestDetails.description}</li>
        <li>Timeframe: ${requestDetails.timeframe}</li>
        <li>Budget: ${requestDetails.budget}</li>
      </ul>
      <p>Please click one of the following buttons to accept or reject the request:</p>

    `;

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
        to: providerEmail,
        subject: subject,
        html: emailHTML,
      });
      console.log("Email sent successfully");
    } catch (error) {
      console.log("Email not sent");
      console.error(error);
    }
  };