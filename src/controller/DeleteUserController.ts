import {Request, Response} from 'express';
import sendEmail from '../utility/nodemailer';
import User from '../model/UserSchema';
import ServiceRequest from '../model/ServiceRequestSchema';
import ContactSchema from '../model/contactSchema';

export const DeleteUser = async (req: Request , res: Response)=>{


    const email = req.query.email;
    try

   { const user = await User.findOne({where:{email: email}});

    if(!user){
       return res.status(404).json({message: "User not Found"});
    }

    const VerificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date();
    verificationCodeExpiresAt.setDate(verificationCodeExpiresAt.getDate() + 1);

    user!.verificationCode = VerificationCode
    user!.verificationCodeExpiresAt = verificationCodeExpiresAt
    await user?.save();

   // const verificationLinkForDeletion = `http://18.221.152.21:5000/auth/delete-user/${user?.roleId}?code=${VerificationCode}`;
   const verificationLinkForDeletion = `https://api.pruuf.pro/auth/delete-user/${user?.roleId}?code=${VerificationCode}`;
    
    // await sendEmail(user!.email ,"Confirmation of Deletion",
    // `Dear Service Provider, \n\nYou have requested the deletion of your account. Confirm deletion by clicking on the following link:\n\n${verificationLinkForDeletion}`)
    const attachments : any=[]
    await sendEmail(user!.email,"Confirmation of Deletion" , `<p>Dear User,</p>
    <p>You have requested the deletion of your account. Confirm deletion by clicking on the following:</p>
    <p><button><a href=${verificationLinkForDeletion} 
    target="_blank">Confirm Deletion</a></button></p>
    <p>If you did not request this, please ignore this email.</p>`
    ,attachments)

    return res.status(200).json({message:"Confirmation email sent"})
}catch(err){
    console.log(err)
    return res.status(500).json({message: "Internal Server Error"});
}
}

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

export const DeletionLinkForUser = async (req: Request , res:Response) =>{
    const userId = req.params.id;
    const code = req.query.code;
try
   { const user = await User.findOne({
    where:{
        roleId: userId,
        verificationCode: code

    }
    })

    const Contactuser = await ContactSchema.findOne({
        where:{
            UserRoleId: userId,
           
    
        }
        })

    if(!user){
        return res.status(404).json({message:"User Not Found"});
    }

    if(isVerificationCodeExpired(user?.verificationCodeExpiresAt)) {
        return res.status(401).json({message:"Link has been expired"});

    }

    //const serviceRequests = await ServiceRequest.findAll({ where: { userId: user?.roleId } });
    //for (const request of serviceRequests) {
      //  request.status = 'archived'; 
       // await request.save();
      //}

    await user?.destroy();
    await Contactuser?.destroy();

    return res.status(200).json({message:"User Deleted Successfully"})
}catch(err){
    console.log(err);
    return res.status(500).json({message:"Internal Server Error"})
}
    


}


function isVerificationCodeExpired(expiresAt: any) {
    if (!expiresAt) {
      return false; 
    }
    const currentDate = new Date();
    return currentDate > new Date(expiresAt);
  }