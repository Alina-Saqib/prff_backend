import { Request,Response } from "express";
import User from "../model/UserSchema";
import ServiceProvider from "../model/ServiceProviderSchema";
import sendEmail from "../utility/nodemailer";
import bcrypt from 'bcryptjs';
export const forgetPassword = async (req:Request ,res:Response) =>{

   const { email, role} = req.body;

   try

  { const provider = await ServiceProvider.findOne({ where: { email } });
  
  
  const user = await User.findOne({ where: { email } });
   if(provider && role.toLowerCase() === 'provider') {
    console.log('here')
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


    const verificationLink = `http://ec2-18-221-152-21.us-east-2.compute.amazonaws.com/reset?id=${provider.roleId}&code=${verificationCode}&role=${role}`;

    const subject = 'Reset Password Link';
    const text = `Link to reset password: ${verificationLink}`;
    sendEmail(email as any, subject, text);

    return res.status(200).json({ message: 'Reset Password Link is send.' });
    

     

   }
   else if(user && role.toLowerCase() === 'user'){

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


    const verificationLink = `http://ec2-18-221-152-21.us-east-2.compute.amazonaws.com/reset?id=${user.roleId}&code=${verificationCode}&role=${role}`;

    const subject = 'Reset Password Link';
    const text = `Link to reset password: ${verificationLink}`;
    sendEmail(email as any, subject, text);

    return res.status(200).json({ message: 'Reset Password Link is send.' });

   }else{

    return res.status(401).json({ message: 'Email or Role Not Found.' });

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
    const id = req.query.id;
    const code = req.query.code;
    const role = req.query.role as string;
console.log(id);
    if (!password || !confirmPassword) {
        return res.status(422).json({ error: `please enter all field properly` });
      }
    
      try {
        const user = await User.findOne({
          where: { roleId: id , verificationCode: code },
        });
        const provider = await ServiceProvider.findOne({
          where: {roleId: id , verificationCode: code},
        });
    
       if (provider && role.toLowerCase() === 'provider') {
          if (isVerificationCodeExpired(provider.verificationCodeExpiresAt)) {
            return res.status(401).json({ message: 'Link has expired' });
          }
         else if(password === confirmPassword){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
          provider.password = hashedPassword
          await provider.save();
          res.json({ message: 'Provider password updated' });}else{

            res.json({ message: 'Password and confirmPassword doesnot match' });
          }
        } else if (user && role.toLowerCase() === 'user') {
          if (isVerificationCodeExpired(user.verificationCodeExpiresAt)) {
            return res.status(401).json({ message: 'Link has expired' });
          }
    
          else if(password === confirmPassword){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
          user.password = hashedPassword
          await user.save();
          res.json({ message: 'User password updated' });}
          else{

            res.json({ message: 'Password and confirmPassword doesnot match' });
          }
        } else {
          return res.status(401).json({ message: 'Invalid Link' });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error Updating Password' });
      }
 

}

function isVerificationCodeExpired(expiresAt: any) {
    if (!expiresAt) {
      return false; 
    }
    const currentDate = new Date();
    return currentDate > new Date(expiresAt);
  }
