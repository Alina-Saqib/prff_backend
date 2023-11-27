import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWSSMSACCESSKEY,
  secretAccessKey: process.env.AWSSECRETACCESSKEY,
  region: process.env.AWSREGOIN,
});


export const sendSms = async function sendSMS(phoneNumber: any, message: any) {
    const sns = new AWS.SNS({apiVersion:'2010-03-31'});
  
    const params = {
      Message: message,
      PhoneNumber: phoneNumber,
      MessageAttributes:
      {'AWS.SNS.SMS.SMSType': {'DataType': 'String', 'StringValue': 'Transactional'}}
    };

      const result = sns.publish(params).promise();
      result.then(function(data){
        console.log(`SMS sent successfully:` ,data.MessageId);
      }).catch(
        function (err) {
            console.error(`Error sending SMS: ${err.message}`);
        });
      
  }
  