import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../model/UserSchema';
import sendEmail from '../utility/nodemailer';
import QuickResponse from '../model/ResponsesSchema';

export const UserRegistration = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, surname, email, phone, gender, zipCode, password, confirmPassword } = req.body;

 
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  if (password === confirmPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {

      const verificationCode = generateVerificationCode();
      const verificationCodeExpiresAt = new Date();
      verificationCodeExpiresAt.setDate(verificationCodeExpiresAt.getDate() + 1);
     
      const newUser = await User.create({
        name,
        surname,
        email,
        phone,
        gender,
        zipCode,
        password: hashedPassword,
        verify: false,
        verificationCode,
        verificationCodeExpiresAt
      });

      // const verificationLink = `http://18.221.152.21:5000/auth/verify?id=${newUser.roleId}&code=${verificationCode}`;
      // and verification Link is  ${verificationLink}
      const subject = 'Verification Code';
      const text = `Your verification code is: ${verificationCode} `;
      sendEmail(email, subject, text);

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
      

      

      res.status(201).json({ message: 'User registered successfully email is sent to you for verification'});
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error registering user' });
    }
  } else {
    res.status(400).json({ error: 'Password and confirm Password do not match' });
  }
};


function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
