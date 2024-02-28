import {Response,Request} from 'express'
import adminConfig from '../model/adminConfig';
import ServiceRequest from '../model/ServiceRequestSchema';

export const setExpiredHoursForRequest = async(req: Request ,res:Response)=>{

    const {hours} = req.body;
    try
{
    if(!hours){
        return res.status(404).json({message:"Please enter the hours"})
    }
   const adminSetting: any = await adminConfig.findOne()
   if(adminSetting){
    await adminSetting.update({ expiredHours: hours });
   }else{
    await adminSetting.create({ expiredHours: hours})
   }

   res.status(200).json({message:"updated"})

}catch(err){
        res.status(500).json({error:"Internal server error",err})
    }

}


export const getAllServiceRequest = async (req: Request, res: Response) => {
    try {
      
        const serviceRequests = await ServiceRequest.findAll({
            order: [['createdAt', 'DESC']]
        });

        if (serviceRequests.length > 0) {
           
            const jsonResponse = serviceRequests.map(request => ({
                id: request.id,
                userId: request.userId,
                category: request.category,
                description: request.description,
                searchRadius: request.searchRadius,
                status: request.status,
                requestExpiresAt: request.requestExpiresAt,
             
            }));

            
            return  res.status(200).json(jsonResponse);
        } else {
            return res.status(404).json({ message: "No service requests found" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal Server error" });
    }
};


export const setExpiryDateOfRequest = async(req: Request , res:Response) =>{

    try{
        const requestId = req.params.id;
        const {expirydays} = req.body

        if(!expirydays){
           return res.status(400).json({message:"Enter duration in days"})
        }
        

        const serviceRequest = await ServiceRequest.findByPk(requestId)

        if(!serviceRequest){
            return res.status(400).json({message:"Service Request not found"})

        }

        const requestExpiresAt  = new Date();
        const hours = expirydays * 24
        console.log(hours)
        requestExpiresAt.setHours(requestExpiresAt.getHours() + hours);
   console.log(requestExpiresAt)
   

  const update= await serviceRequest?.update({
        requestExpiresAt,
        status:"searching"
    });

    console.log(update)
    if(update)

   {return res.status(200).json({message:"Request updated"})}else{


    return  res.status(404).json({message:"Request is not Expired"})
}


    }catch(err){
        console.log(err);
        res.status(500).json({ error: "Internal Server error" });

    }
}
