import {Request, Response} from 'express'
import draftSchema from '../model/draftSchema';
import phoneDraft from '../model/phoneDraft';

export const saveDraft = async(req:Request,res: Response )=>{
  
 try {  
    const {toEmails , subject , emailContent, scheduledTime} = req.body;
    const toEmailsString = toEmails?.join(', ');

    if(!emailContent ){
        return res.status(400).json({message: "Fill email content to save draft"})
    }

    const draft = await draftSchema.create({
        toEmails: toEmailsString , subject , emailContent, scheduledTime
    })


    if(draft){
        return res.status(200).json({message: "Draft saved successfully"})
    }else{

        return  res.status(401).json({message: "Error is saving draft"})
    }




    

}catch(err){
    console.log(err)
    return  res.status(500).json({error: "Internal server Error",err})
}


}

export const getDraft = async(req:Request , res: Response) =>{

    try {
        const drafts = await draftSchema.findAll();
        if(drafts && drafts.length >0)
       { return res.status(200).json({ drafts });}
       else
       return res.status(400).json({message:"No draft Found"})
      } catch (error) {
        return res.status(500).json({ error: 'Could not retrieve drafts' });
      }
}

export const getDraftById = async(req:Request , res: Response) =>{
    const { id } = req.params;
    try {
        const draft = await draftSchema.findByPk(id);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    return res.status(200).json({ draft });
      } catch (error) {
        return res.status(500).json({ error: 'Could not retrieve draft' });
      }
}

export const updateDraft = async (req: Request, res:Response)=>{
    const {id} = req.params;
    const {toEmails, subject,emailContent,scheduledTime} =req.body;
    const toEmailsString = toEmails?.join(', ');
    try{
        const draft = await draftSchema.findByPk(id);
        if (!draft) {
          return res.status(404).json({ error: 'Draft not found' });
        }
        await draft.update({
            toEmails:toEmailsString,
            subject,
            emailContent,
            scheduledTime

        })
        return res.status(200).json({message:"Successfully Updated draft"})
    
    }
    catch(err){
        return res.status(500).json({ error: 'Could not update draft' });
    }
    
    }

export const deleteDraft = async (req: Request, res:Response)=>{
const {id} = req.params;
try{
    const draft = await draftSchema.findByPk(id);
    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    await draft.destroy();
    return res.status(200).json({message:"Successfully deleted draft"})

}
catch(err){
    return res.status(500).json({ error: 'Could not delete draft' });
}

}



//phone draft

export const savePhoneDraft = async(req:Request,res: Response )=>{
  
    try {  
       const {phoneNumber , text , scheduledTime,frequency} = req.body;
       const phoneNumberString = phoneNumber?.join(', ');
   
       if(!text ){
           return res.status(400).json({message: "Fill text to save draft"})
       }
   
       const draft = await phoneDraft.create({
        phoneNumber: phoneNumberString , text , scheduledTime,frequency
       })
   
   
       if(draft){
           return res.status(200).json({message: "Draft saved successfully"})
       }else{
   
           return  res.status(401).json({message: "Error is saving draft"})
       }
   
   
   
   
       
   
   }catch(err){
       console.log(err)
       return  res.status(500).json({error: "Internal server Error",err})
   }
   
   
   }
   
   export const getPhoneDraft = async(req:Request , res: Response) =>{
   
       try {
           const drafts = await phoneDraft.findAll();
           if(drafts && drafts.length >0)
          { return res.status(200).json({ drafts });}
          else
          return res.status(400).json({message:"No draft Found"})
         } catch (error) {
           return res.status(500).json({ error: 'Could not retrieve drafts' });
         }
   }
   
   export const getPhoneDraftById = async(req:Request , res: Response) =>{
       const { id } = req.params;
       try {
           const draft = await phoneDraft.findByPk(id);
       if (!draft) {
         return res.status(404).json({ error: 'Draft not found' });
       }
       return res.status(200).json({ draft });
         } catch (error) {
           return res.status(500).json({ error: 'Could not retrieve draft' });
         }
   }
   
   export const updatePhoneDraft = async (req: Request, res:Response)=>{
       const {id} = req.params;
       const {phoneNumber, text,scheduledTime,frequency} =req.body;
       const phoneNumberString = phoneNumber?.join(', ');
       try{
           const draft = await phoneDraft.findByPk(id);
           if (!draft) {
             return res.status(404).json({ error: 'Draft not found' });
           }
           await draft.update({
            phoneNumber:phoneNumberString,
            text,scheduledTime,frequency
   
           })
           return res.status(200).json({message:"Successfully Updated draft"})
       
       }
       catch(err){
           return res.status(500).json({ error: 'Could not update draft' });
       }
       
       }
   
   export const deletePhoneDraft = async (req: Request, res:Response)=>{
   const {id} = req.params;
   try{
       const draft = await phoneDraft.findByPk(id);
       if (!draft) {
         return res.status(404).json({ error: 'Draft not found' });
       }
       await draft.destroy();
       return res.status(200).json({message:"Successfully deleted draft"})
   
   }
   catch(err){
       return res.status(500).json({ error: 'Could not delete draft' });
   }
   
   }