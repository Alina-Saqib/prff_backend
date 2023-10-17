import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import ServiceProvider from '../model/ServiceProviderSchema'; 
import sendEmail from '../utility/nodemailer';

export const serviceProviderRegistration = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { business, email, category, phone, service, zipCode, password, confirmPassword } = req.body;

 
  const existingServiceProvider = await ServiceProvider.findOne({ where: { email } });

  if (existingServiceProvider) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  if (password === confirmPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {

      const verificationCode = generateVerificationCode();
     
      // Create a new service provider using the Sequelize ServiceProvider model
      const newServiceProvider = await ServiceProvider.create({
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

      const verificationLink = `http://18.221.152.21:5000/auth/verify?id=${newServiceProvider.roleId}&code=${verificationCode}`;

      const subject = 'Verification Code';
      const text = `Your verification code is: ${verificationCode} and verification Link is  ${verificationLink}`;
      sendEmail(email, subject, text);

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
