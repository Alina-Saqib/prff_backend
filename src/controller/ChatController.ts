import { Request, Response } from 'express';
import Chat from '../model/ChatSchema';
import sequelize from '../config/connectDB';  
import { Op } from 'sequelize';
import ServiceProvider from '../model/ServiceProviderSchema';



export const fetchChat = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'Both are required.' });
    }

    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { user1: userId },
          { user2: userId },
        ],
      },
    });

    if (!chats || chats.length === 0) {
      return res.status(404).json({ error: 'Chat not found.' });
    }

  
    const chatData = chats.map(async (chat) => {
      const messages = JSON.parse(chat.messages as any);
      const user1 = chat.user1;
      const user2 = chat.user2;

      // Check if either user is a provider and fetch business data if they are
      let businessName;

      // Check if user1 is a provider
      if (user1) {
        const provider1 = await ServiceProvider.findByPk(user1);
        if (provider1) {
          // If user1 is a provider, fetch their business data
          businessName = provider1.business;
        }
      }

      // Check if user2 is a provider
      if (user2 && !businessName) {
        const provider2 = await ServiceProvider.findByPk(user2);
        if (provider2) {
          // If user2 is a provider and user1 is not, fetch their business data
          businessName = provider2.business;
        }
      }

      return {
        ...chat.toJSON(),
        messages,
        businessName,
      };
    });

    const chatDataWithBusiness = await Promise.all(chatData);

    return res.status(200).json(chatDataWithBusiness);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const messageController = async (req: Request, res: Response) => {
  try {
    const { chatId, sender, text } = req.body;
    const chat = await Chat.findByPk(chatId);
 

    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }


   
    const existingMessages = (chat.messages || []) as {
        sender: string;
        text: string;
        timestamp: Date;
      }[];
 
    const newMessage = {
      sender,
      text,
      timestamp: new Date(),
    };
 
    existingMessages.push(newMessage)
   
    const updatedMessages = existingMessages;

    const Updatechat = await Chat.findByPk(chatId);
    Updatechat!.messages =updatedMessages;
    await Updatechat!.save();

  

    return res.status(201).json(Updatechat);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



export const  messageFetchController = async(req:Request,res:Response) =>{

  try {
    const chatId = req.params.chatId;

    const chat = await Chat.findByPk(chatId);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const messages = chat.messages as any

    return res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }

}

