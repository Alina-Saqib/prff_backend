import {Request, Response} from 'express';
import ServiceProvider from '../model/ServiceProviderSchema';
import sendEmail from '../utility/nodemailer';
import User from '../model/UserSchema';

export const DeleteProvider = async (req: Request , res: Response)=>{


    const email = req.query.email;
    try

   { const provider = await ServiceProvider.findOne({where:{email: email}});
   const user = await User.findOne({where:{email: email}});

    if(!provider){
        res.status(404).json({message: "Provider not Found"});
    }

    const VerificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = new Date();
    verificationCodeExpiresAt.setDate(verificationCodeExpiresAt.getDate() + 1);

    provider!.verificationCode = VerificationCode
    provider!.verificationCodeExpiresAt = verificationCodeExpiresAt
    await provider?.save();
    user!.verificationCode = VerificationCode
    user!.verificationCodeExpiresAt = verificationCodeExpiresAt
    await user?.save();

    const verificationLinkForDeletion = `http://localhost:5000/auth/delete-provider/${provider?.email}?code=${VerificationCode}`;
    
    // await sendEmail(provider!.email ,"Confirmation of Deletion",
    // `Dear Service Provider, \n\nYou have requested the deletion of your account. Confirm deletion by clicking on the following link:\n\n${verificationLinkForDeletion}`)

    await sendEmail(provider!.email,"Confirmation of Deletion" , `<p>Dear Service Provider,</p>
    <p>You have requested the deletion of your account. Confirm deletion by clicking on the following:</p>
    <p><button><a href=${verificationLinkForDeletion} 
    target="_blank">Confirm Deletion</a></button></p>
    <p>If you did not request this, please ignore this email.</p>`
    )
    res.status(200).json({message:"Confirmation email sent"})
}catch(err){
    console.log(err)
    res.status(500).json({message: "Internal Server Error"});
}
}

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }



  export const DeletionLinkForProvider = async (req: Request , res:Response) =>{
    const email = req.params.email;
    const code = req.query.code;
try
   { const provider = await ServiceProvider.findOne({
    where:{
        email: email,
        verificationCode: code

    }
    })

    const user = await User.findOne({
        where:{
            email: email,
            verificationCode: code
    
        }
        })
    

    if(!provider){
        res.status(404).json({message:"Provider Not Found"});
    }

    if(isVerificationCodeExpired(provider?.verificationCodeExpiresAt)) {
        res.status(401).json({message:"Link has been expired"});

    }

    await provider?.destroy();
    await user?.destroy();

    res.status(200).json({message:"Provider Deleted Successfully"})
}catch(err){
    console.log(err);
    res.status(500).json({message:"Internal Server Error"})
}
    


}


function isVerificationCodeExpired(expiresAt: any) {
    if (!expiresAt) {
      return false; 
    }
    const currentDate = new Date();
    return currentDate > new Date(expiresAt);
  }

