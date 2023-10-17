import { Request,Response } from "express";
import User from "../model/UserSchema";
import ServiceProvider from "../model/ServiceProviderSchema";
import sendEmail from "../utility/nodemailer";
export const forgetPassword = async (req:Request ,res:Response) =>{

   const { email, role} = req.body;

   try

  { const user = await User.findOne({where:{email}})
   const provider = await ServiceProvider.findOne({where:{email}})

   if(provider && role.toLowerCase === 'provider') {
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date();
    verificationCodeExpiresAt.setDate(verificationCodeExpiresAt.getDate() + 1); 

    
    await ServiceProvider.update(
        {
          verificationCode,
          verificationCodeExpiresAt,
        },
        { where: { email } }
      );


    const verificationLink = `http://localhost:5000/auth/verify?code=${verificationCode}`;

    const subject = 'Reset Password Link';
    const text = `Link to reset password: ${verificationLink}`;
    sendEmail(email as any, subject, text);

    return res.status(200).json({ message: 'Reset Password Link is send.' });
    

     

   }
   else if(user && role.toLowerCase === 'user'){

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date();
    verificationCodeExpiresAt.setDate(verificationCodeExpiresAt.getDate() + 1); 

    
    await ServiceProvider.update(
        {
          verificationCode,
          verificationCodeExpiresAt,
        },
        { where: { email } }
      );


    const verificationLink = `http://localhost:5000/auth/verify?code=${verificationCode}`;

    const subject = 'Reset Password Link';
    const text = `Link to reset password: ${verificationLink}`;
    sendEmail(email as any, subject, text);

    return res.status(200).json({ message: 'Reset Password Link is send.' });

   }else{

    return res.status(200).json({ message: 'Email or Role Not Found.' });

   }}catch(err) {
    console.log(err)
    res.status(500).json({ error: 'Error forgeting Password' });

   }



} 


function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }


export const ResetPassword = async (req: Request , res: Response ) =>{

    const {password ,confirmPassword }= req.body;
    const code = req.query.code;
    if (!password || !confirmPassword) {
        return res.status(422).json({ error: `please enter all field properly` });
      }
    
      try {
        const user = await User.findOne({
          where: { verificationCode: code },
        });
        const provider = await ServiceProvider.findOne({
          where: {verificationCode: code},
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

function isVerificationCodeExpired(expiresAt: any) {
    if (!expiresAt) {
      return false; 
    }
    const currentDate = new Date();
    return currentDate > new Date(expiresAt);
  }