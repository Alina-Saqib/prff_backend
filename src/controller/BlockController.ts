import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Block from '../model/blockSchema';
import Chat from '../model/ChatSchema';

export const blockUser = async (req: Request, res: Response) => {
  const { blockerId, blockedId } = req.body;

  try {

  
    const existingBlock = await Block.findOne({
      where: {
        blockerId,
        blockedId,
      },
    });

    if (existingBlock) {
      return res.status(400).json({ message: 'User is already blocked' });
    }

    const block = await Block.create({
      blockerId: blockerId,
      blockedId: blockedId,
    });

  let chat = await Chat.findOne({
      where: {
        [Op.or]: [
          { user1: blockerId, user2: blockedId },
          { user1: blockedId, user2: blockerId },
        ],
      },
    });  

console.log(chat);
      
      chat!.isBlocked = true;
      chat!.BlockedBy =blockerId;
      await chat!.save();
console.log(chat);

    return res.status(201).json(block);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error blocking user' });
  }
};

export const unblockUser = async (req: Request, res: Response) => {
  const { blockerId, blockedId } = req.body;

  try {
    const block = await Block.findOne({
      where: {
        blockerId,
        blockedId,
      },
    });

    if (!block) {
      return res.status(400).json({ message: 'User is not blocked' });
    }

    await block.destroy();

   let chat = await Chat.findOne({
      where: {
        [Op.or]: [
          { user1: blockerId, user2: blockedId },
          { user1: blockedId, user2: blockerId },
        ],
      },
    });  
      
      chat!.isBlocked = false;
      chat!.BlockedBy = null;
      await chat!.save();
console.log(chat!.BlockedBy) 
console.log(chat) 
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error unblocking user' });
  }
};
