import e, {Request , Response} from 'express'
import leadSchema from '../model/leadSchema';
import ContactSchema from '../model/contactSchema';

export const uploadLeads = async (req:Request , res:Response)=>{

 try{    const {name , phone ,email} = req.body;

    if (!name || !phone || !email){
        return res.status(400).json({message:"Fill all the fields"})
    }
    const emailPhoneExists = await leadSchema.findOne({where:{email,phone}})
    if(emailPhoneExists) {
        return res.status(401).json({message:"Email or Phone number already exitis"})
    }
    const newLead = await leadSchema.create({
        name,
        phone,
        email
    })
    if(newLead)
    {
        const contactEntry = await ContactSchema.create({
            phone: newLead.phone,
            email: newLead.email, 
            userId: newLead.id,
          });
        
          if (contactEntry) 
            return res.status(200).json({ message: 'Lead user created Successfully' });
           else 
            
            return res.status(400).json({ message: 'Lead created but contact entry failed' });
        }
    else {
        return res.status(400).json({message:'lead is not created due to some error'})
    }}catch(err){
        return res.status(500).json({message:'Internal Server Error'})   
    }

}

export const getLeads  = async (req:Request, res:Response) =>{

    try{
        const allLeads = await leadSchema.findAll();

        if(allLeads  && allLeads.length > 0  ){

            return res.status(200).json(allLeads)
        }
        return res.status(400).json({message:'No Leads Found'})

    }catch(err){
        return res.status(500).json({message:'Internal Server Error'})   
    }
} 

export const deteleLeads  = async(req: Request , res: Response)=>{

const {id} = req.params;
try {
    const lead= await leadSchema.findByPk(id)
    const leadContact = await ContactSchema.findOne({where:{userId: id}})
    if(!lead || !leadContact){
        return res.status(400).json({message:"Lead not found"})

    }

    await lead.destroy();
    await leadContact.destroy();
    return res.status(200).json({message:"Lead deleted Successfully"})
} catch (error) {
    return res.status(500).json({error:"internal sever error"})
}
}