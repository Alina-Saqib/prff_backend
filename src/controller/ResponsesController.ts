import { Request , Response } from "express"
import QuickResponse from "../model/ResponsesSchema";

export const addResponses = async(req: Request , res: Response) =>{
    const { name, message, userId } = req.body;
  try {
    const response = await QuickResponse.create({ name, message, userId });
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create quick response' });
  }

}


export const getResponses =async (req: Request , res: Response) => {
    const { userId } = req.params;
    try {
     if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
         }
      const responses = await QuickResponse.findAll({ where: { userId } });
      res.json(responses);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve quick responses' });
    }
    
}

export const editResponses =async (req: Request , res: Response) =>{
    const { id } = req.params;
    const { name, message, userId } = req.body;
    try {
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
          }
      
          const existingResponse = await QuickResponse.findByPk(id);
      
          if (!existingResponse) {
            return res.status(404).json({ error: 'Quick response not found' });
          }
      await QuickResponse.update({ name, message, userId }, { where: { id } });
      res.json({ message: 'Quick response updated successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update quick response' });
    }

}

export const deleteResponses =async (req: Request , res: Response) => {
    const { id } = req.params;
  try {

    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }
  
      const existingResponse = await QuickResponse.findByPk(id);
  
      if (!existingResponse) {
        return res.status(404).json({ error: 'Quick response not found' });
      }
    await QuickResponse.destroy({ where: { id } });
    res.json({ message: 'Quick response deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete quick response' });
  }
    
}