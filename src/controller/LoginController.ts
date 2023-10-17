import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import User from '../model/UserSchema'; 
import ServiceProvider from '../model/ServiceProviderSchema'; 
import sendEmail from '../utility/nodemailer';

export const loginController = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password , role} = req.body;
    const provider = await ServiceProvider.findOne({ where: { email } });
    const user = await User.findOne({ where: { email } });

    if (provider && role.toLowerCase() === 'provider') {
      const passwordMatch = await bcrypt.compare(password, provider.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
      if (!provider.verify) {
        return res.status(401).json({ message: 'User not verified. Please check your email for verification code.' });
      }

      const token = jwt.sign({ providerId: provider.roleId }, process.env.JWT_SECRET as Secret, {
        expiresIn: '7d',
      });

      const providerResponse ={
        id: provider.roleId,
        business: provider.business,
        email: provider.email,
        category: provider.category,
        phone: provider.phone,
        service: provider.service,
        zipCode: provider.zipCode


      }
      
      
      res.json({ message: 'Login successful as provider', provider: providerResponse, token });
    } 

    else if (user && role.toLowerCase() === 'user') {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
      if (!user.verify) {
        return res.status(401).json({ message: 'User not verified. Please check your email for verification code.' });
      }

      const token = jwt.sign({ userId: user.roleId }, process.env.JWT_SECRET as Secret, {
        expiresIn: '7d',
      });

      const userResponse ={
        id: user.roleId,
        name: user.name,
        surname: user.surname,
        email: user.email,
        gender: user.gender,
        phone: user.phone,
        zipCode: user.zipCode


      }

      res.json({ message: 'Login successful as user', userResponse, token });
    } 
      
    else{
    
    return res.status(401).json({ message: 'Email not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};



export const VerifyUser = async (req: Request, res: Response) => {
  const email = req.query.email;
  const { code } = req.body;

  try {
    const user = await User.findOne({
      where: { email, verificationCode: code, verify: false },
    });
    const provider = await ServiceProvider.findOne({
      where: { email, verificationCode: code, verify: false },
    });

    if (provider && user) {
      if (isVerificationCodeExpired(user.verificationCodeExpiresAt)) {
        return res.status(401).json({ message: 'Verification code has expired' });
      }

      provider.verify = true;
      user.verify = true;
      await provider.save();
      await user.save();
      res.json({ message: 'Verification successful' });
    } else if (provider) {
      if (isVerificationCodeExpired(provider.verificationCodeExpiresAt)) {
        return res.status(401).json({ message: 'Verification code has expired' });
      }

      provider.verify = true;
      await provider.save();
      res.json({ message: 'Provider verification successful' });
    } else if (user) {
      if (isVerificationCodeExpired(user.verificationCodeExpiresAt)) {
        return res.status(401).json({ message: 'Verification code has expired' });
      }

      user.verify = true;
      await user.save();
      res.json({ message: 'User verification successful' });
    } else {
      return res.status(401).json({ message: 'Invalid verification code' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error verifying user' });
  }
};

function isVerificationCodeExpired(expiresAt: any) {
  if (!expiresAt) {
    return false; 
  }
  const currentDate = new Date();
  return currentDate > new Date(expiresAt);
}


export const ResendVerificationEmail = async (req: Request, res: Response) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    const provider = await ServiceProvider.findOne({ where: { email } });

    if(provider){

      if(provider.verify){
        return res.status(400).json({ message: 'Provider is already verified' });
      }
      const verificationCode = generateVerificationCode();
      const verificationCodeExpiresAt= new Date();
      verificationCodeExpiresAt.setDate(verificationCodeExpiresAt.getDate() + 1); 
  
  
      await ServiceProvider.update(
        {
          verificationCode,
          verificationCodeExpiresAt,
        },
        { where: { email } }
      );

      const verificationLink = `http://18.221.152.21:5000/auth/verify?code=${verificationCode}`;
  
      const subject = 'Verification Code';
      const text = `Your verification code is: ${verificationCode}  and verification Link is  ${verificationLink}`;
      sendEmail(email as any, subject, text);
  
      return res.status(200).json({ message: 'New verification code has been sent.' });

    }

    else if(user)

  {  if (user.verify) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date();
    verificationCodeExpiresAt.setDate(verificationCodeExpiresAt.getDate() + 1); 


    await User.update(
      {
        verificationCode,
        verificationCodeExpiresAt,
      },
      { where: { email } }
    );

    const verificationLink = `http://18.221.152.21:5000/auth/verify?code=${verificationCode}`;

    const subject = 'Verification Code';
    const text = `Your verification code is: ${verificationCode}   and verification Link is  ${verificationLink}`;
    sendEmail(email as any, subject, text);

    return res.status(200).json({ message: 'New verification code has been sent.' });}

    else {

      return res.status(200).json({ message: 'Email Not Found.' });

    }
  } catch (error) {
    res.status(500).json({ error: 'Error resending verification code' });
  }
};


function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


export const verificationLink = async (req: Request , res: Response) =>{

  const code = req.query.code;
  const id = req.query.id;

  try {
    const user = await User.findOne({
      where: { roleId: id, verificationCode: code, verify: false },
    });
    const provider = await ServiceProvider.findOne({
      where: { roleId: id, verificationCode: code, verify: false },
    });

    if (provider && user) {
      if (isVerificationCodeExpired(user.verificationCodeExpiresAt)) {
        return res.status(401).json({ message: 'Verification code has expired' });
      }

      provider.verify = true;
      user.verify = true;
      await provider.save();
      await user.save();
      res.json({ message: 'Verification successful' });
    } else if (provider) {
      if (isVerificationCodeExpired(provider.verificationCodeExpiresAt)) {
        return res.status(401).json({ message: 'Verification code has expired' });
      }

      provider.verify = true;
      await provider.save();
      res.json({ message: 'Provider verification successful' });
    } else if (user) {
      if (isVerificationCodeExpired(user.verificationCodeExpiresAt)) {
        return res.status(401).json({ message: 'Verification code has expired' });
      }

      user.verify = true;
      await user.save();
      res.json({ message: 'User verification successful' });
    } else {
      return res.status(401).json({ message: 'Invalid verification code' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error verifying user' });
  }

} 