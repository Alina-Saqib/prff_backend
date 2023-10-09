import { Request, Response } from 'express';
import Chat from '../model/ChatSchema';
import sequelize from '../config/connectDB';  
import { Op } from 'sequelize';



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

  
    const chatData = chats.map((chat) => {
      const messages = JSON.parse(chat.messages as any);
      return {
        ...chat.toJSON(),
        messages,
      };
    });

    return res.status(200).json(chatData);
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

    const messages = JSON.parse(chat.messages as any);

    return res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }

}

