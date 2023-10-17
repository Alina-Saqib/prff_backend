import ServiceCategory from "../model/serviceCategoriesSchema";
import { Request, Response } from "express";


export const getCategory = async (req: Request, res: Response) => {
    try {
      const category = await ServiceCategory.findAll();
  
      const messagesResponse = category.map((cat) => ({
        id: cat.id,
        category: cat.ServiceCategory,
      }));
  
      res.status(200).json(messagesResponse);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }