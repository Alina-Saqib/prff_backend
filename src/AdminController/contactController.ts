import { Op } from "sequelize";
import GroupSchema from "../model/contactGroupSchema";
import ContactSchema from "../model/contactSchema"
import {Request, Response} from 'express'


export const getContacts = async (req: Request, res: Response) => {
    try {
      const allContacts = await ContactSchema.findAll({
        attributes: ['email', 'phone', 'userId'], 
      });
  
      if (allContacts && allContacts.length > 0) {
        const filteredContacts = allContacts.map((contact) => ({
          email: contact.email,
          phone: contact.phone,
          userId: contact.userId,
        }));
  
        return res.status(200).json(filteredContacts);
      }
  
      return res.status(400).json({ message: 'No Contacts Found' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };


//Group Schema


export const createGroup = async (req: Request, res: Response) => {
  const { name, users ,grouptype} = req.body;
  const usersArray = users.split(",");
  console.log(usersArray);

  if (usersArray.length < 2) {
    return res.status(400).json({ message: 'At least two emails are required to create a group' });
  }

  try {
    const newGroup: any = await GroupSchema.create({ name,grouptype });

    const selectedUsers = await ContactSchema.findAll({
      where: {
        userId:usersArray,
        
      },
    });

   
      await newGroup.addContactSchema(selectedUsers);

    res.status(201).json({ message: 'Group created successfully', newGroup });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ message: 'Error creating group', error });
  }
}

export const getGroups = async(req: Request , res: Response) =>{

  try {
    
    const groups = await GroupSchema.findAll({
      include: [{
        model: ContactSchema,
        attributes: ['id', 'phone', 'email', 'userId'], 
      }],
    });
    
   
    res.status(200).json({ groups });
  } catch (error) {
    console.error('Error fetching groups with users:', error);
    res.status(500).json({ message: 'Error fetching groups with users', error });
  }
}

// Update Group by ID
export const updateGroup = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, users} = req.body;
  const usersArray = users.split(",");

  if (usersArray.length < 2) {
    return res.status(400).json({ message: 'At least two emails are required to update a group' });
  }

  try {
    const groupToUpdate: any = await GroupSchema.findByPk(id);
    if (!groupToUpdate) {
      return res.status(404).json({ message: 'Group not found' });
    }

    await groupToUpdate.update({ name });

    const selectedUsers = await ContactSchema.findAll({
      where: {
        userId: usersArray,
      },
    });

    await groupToUpdate.setContactSchemas(selectedUsers);

    res.status(200).json({ message: 'Group updated successfully', updatedGroup: groupToUpdate });
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ message: 'Error updating group', error });
  }
};

// Get Group by ID
export const getGroupByID = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const group = await GroupSchema.findByPk(id, {
      include: [{
        model: ContactSchema,
        attributes: ['id', 'phone', 'email', 'userId'],
      }],
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.status(200).json({ group });
  } catch (error) {
    console.error('Error fetching group by ID:', error);
    res.status(500).json({ message: 'Error fetching group by ID', error });
  }
};

// Delete Group
export const deleteGroup = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const groupToDelete = await GroupSchema.findByPk(id);
    if (!groupToDelete) {
      return res.status(404).json({ message: 'Group not found' });
    }

    await groupToDelete.destroy();

    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ message: 'Error deleting group', error });
  }
};
