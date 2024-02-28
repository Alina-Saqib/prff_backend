import { deteleLeads, getLeads, uploadLeads } from '../AdminController/leadController';
import { createGroup, deleteGroup, getContacts, getGroupByID, getGroups, updateGroup } from '../AdminController/contactController';
import express from 'express';
import { adminEmailSend, deleteEmails, getEmails, getEmailsById } from '../AdminController/emailController';
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get('/', getContacts);
router.post('/leads', uploadLeads);
router.get('/leads', getLeads);
router.delete('/delete-leads/:id',deteleLeads)
router.post('/send-Email',upload.array('attachments'), adminEmailSend)
router.get('/get-Emails', getEmails);
router.get('/get-Emails-Byid/:id', getEmailsById);
router.delete('/delete-emails/:id', deleteEmails)
//group routes

router.post('/create-group' ,createGroup)
router.get('/groups' , getGroups);
router.get('/groups-by-id/:id' ,getGroupByID);
router.put('/update-group/:id', updateGroup);
router.delete('/delete-group/:id', deleteGroup);


export default router;