import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import ServiceProvider from '../model/ServiceProviderSchema'; 
import sendEmail from '../utility/nodemailer';
import User from '../model/UserSchema';
import QuickResponse from '../model/ResponsesSchema';
import { sendSms } from '../utility/phoneSms';

export const serviceProviderRegistration = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { business, email, category, phone, service, zipCode, password, confirmPassword } = req.body;

 
  const existingServiceProvider = await ServiceProvider.findOne({ where: { email } });
  const user = await User.findOne({ where: { email } });

  
  if (existingServiceProvider) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  if (password === confirmPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {

      const verificationCode = generateVerificationCode();
let newServiceProvider;
      if(!user)
     
   {   

    console.log("user is not")
      newServiceProvider = await ServiceProvider.create({
        business,
        email,
        category,
        phone,
        service,
        zipCode,
        password: hashedPassword,
        verify: false,
        verificationCode,
      });

      
      const newUser = await User.create({
        name: business,
        email,
        category,
        phone,
        zipCode,
        password:hashedPassword,
        verify:false,
        verificationCode
      })
      const userId = newUser.roleId;
      const userPredefinedResponses = [
        { message: 'I am Looking for someone to do some work in _____ as soon as possible when you are free to give me estimate.' },
    
     
      ];
  
     try {
          for (const response of  userPredefinedResponses ) {
            await QuickResponse.create({ userId, message: response.message });
          }
        } catch (error) {
          console.error('Error adding predefined responses to user:', error);
          throw error;
        }
} else{

        console.log("user is present")
       newServiceProvider = await ServiceProvider.create({
          business,
          email,
          category,
          phone,
          service,
          zipCode,
          password: hashedPassword,
          verify: false,
          verificationCode,
        });



      }

      // const verificationLink = `http://18.221.152.21:5000/auth/verify?id=${newServiceProvider.roleId}&code=${verificationCode}`;
      // and verification Link is  ${verificationLink}
      const subject = 'Verification Code';
      const text = `Your verification code is: ${verificationCode}`;
      sendEmail(email, subject, text);
      sendSms(phone,`${text}`)
      const userId = newServiceProvider.roleId;
      const providerPredefinedResponses = [
        { message: 'I understand you are looking for a _____ for some work to be done.' },
        
      ];
  
     try {
          for (const response of  providerPredefinedResponses ) {
            await QuickResponse.create({ userId, message: response.message });
          }
        } catch (error) {
          console.error('Error adding predefined responses to user:', error);
          throw error;
        }


      res.status(201).json({ message: 'Service provider registered successfully. Email is send for verification.' });
    } catch (error) {
      res.status(500).json({ error: 'Error registering service provider' });
    }
  } else {
    res.status(400).json({ error: 'Password and confirm Password do not match' });
  }
};

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
