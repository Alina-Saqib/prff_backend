
import {Request, Response} from 'express'
import templateSchema from '../model/templateSchema';
import phoneTemplates from '../model/phoneTemplates';

export const savetemplate = async(req:Request,res: Response )=>{
  
 try {  
    const {subject , content} = req.body;
    
    if(!content ){
        return res.status(400).json({message: "Fill content to save template"})
    }

    const template = await templateSchema.create({
         subject , content
    })


    if(template){
        return res.status(200).json({message: "Template saved successfully"})
    }else{

        return  res.status(401).json({message: "Error is saving template"})
    }




    

}catch(err){
    console.log(err)
    return  res.status(500).json({error: "Internal server Error"})
}


}

export const gettemplates = async(req:Request , res: Response) =>{

    try {
        const templates = await templateSchema.findAll();
        if(templates && templates.length >0)
       { return res.status(200).json({ templates });}
       else
       return res.status(400).json({message:"No template Found"})
      } catch (error) {
        return res.status(500).json({ error: 'Could not retrieve templates' });
      }
}

export const gettemplateById = async(req:Request , res: Response) =>{
    const { id } = req.params;
    try {
        const template = await templateSchema.findByPk(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    return res.status(200).json({ template });
      } catch (error) {
        return res.status(500).json({ error: 'Could not retrieve template' });
      }
}

export const updatetemplate = async (req: Request, res:Response)=>{
    const {id} = req.params;
    const {subject,content} =req.body;
    try{
        const template = await templateSchema.findByPk(id);
        if (!template) {
          return res.status(404).json({ error: 'Template not found' });
        }
        await template.update({
            subject,
            content

        })
        return res.status(200).json({message:"Successfully Updated template"})
    
    }
    catch(err){
        return res.status(500).json({ error: 'Could not update template' });
    }
    
    }

export const deletetemplate = async (req: Request, res:Response)=>{
const {id} = req.params;
try{
    const template = await templateSchema.findByPk(id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    await template.destroy();
    return res.status(200).json({message:"Successfully deleted template"})

}
catch(err){
    return res.status(500).json({ error: 'Could not delete template' });
}

}



//phone templates 

export const savePhonetemplate = async(req:Request,res: Response )=>{
  
    try {  
       const { content} = req.body;
       
       if(!content ){
           return res.status(400).json({message: "Fill content to save template"})
       }
   
       const template = await phoneTemplates.create({
            content
       })
   
   
       if(template){
           return res.status(200).json({message: "Template saved successfully"})
       }else{
   
           return  res.status(401).json({message: "Error is saving template"})
       }
   
   
   
   
       
   
   }catch(err){
       console.log(err)
       return  res.status(500).json({error: "Internal server Error"})
   }
   
   
   }
   
   export const getPhonetemplates = async(req:Request , res: Response) =>{
   
       try {
           const templates = await phoneTemplates.findAll();
           if(templates && templates.length >0)
          { return res.status(200).json(templates);}
          else
          return res.status(400).json({message:"No template Found"})
         } catch (error) {
           return res.status(500).json({ error: 'Could not retrieve templates' });
         }
   }
   
   export const getPhonetemplateById = async(req:Request , res: Response) =>{
       const { id } = req.params;
       try {
           const template = await phoneTemplates.findByPk(id);
       if (!template) {
         return res.status(404).json({ error: 'Template not found' });
       }
       return res.status(200).json({ template });
         } catch (error) {
           return res.status(500).json({ error: 'Could not retrieve template' });
         }
   }
   
   export const updatePhonetemplate = async (req: Request, res:Response)=>{
       const {id} = req.params;
       const {content} =req.body;
       try{
           const template = await phoneTemplates.findByPk(id);
           if (!template) {
             return res.status(404).json({ error: 'Template not found' });
           }
           await template.update({
               content
   
           })
           return res.status(200).json({message:"Successfully Updated template"})
       
       }
       catch(err){
           return res.status(500).json({ error: 'Could not update template' });
       }
       
       }
   
   export const deletePhonetemplate = async (req: Request, res:Response)=>{
   const {id} = req.params;
   try{
       const template = await phoneTemplates.findByPk(id);
       if (!template) {
         return res.status(404).json({ error: 'Template not found' });
       }
       await template.destroy();
       return res.status(200).json({message:"Successfully deleted template"})
   
   }
   catch(err){
       return res.status(500).json({ error: 'Could not delete template' });
   }
   
   }
