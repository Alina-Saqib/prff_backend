import twilio from 'twilio';

const accountSid = 'AC72e103564d726dd11a062d57ea2f774b';
const authToken = 'cfe285e0f8c99b91498a4b7670d3cd8a';


export const phoneSms = (text: string, phone: string): Promise<string> => {
  const client = twilio(accountSid, authToken);

  let fromNumber = 'PRUUF'; 

  if (phone.startsWith('+1')) {
    fromNumber = '+18336623656'; 
  }

  return client.messages.create({
    body: text,
    from: fromNumber,
    to: phone
  })
  .then(message => {
    console.log(message.sid);
    return message.sid;
  })
  .catch(error => {
    console.error('Error sending message:', error);
    throw new Error('Error sending message');
  });
};
