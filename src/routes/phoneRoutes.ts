
import { deleteSMS, getSMS, getSMSById, sendSms } from '../AdminController/phoneSmsController';
import express from 'express';

const router = express.Router();

router.post('/send-sms', sendSms)
router.get('/get-sms', getSMS);
router.get('/get-sms-Byid/:id', getSMSById);
router.delete('/delete-sms/:id', deleteSMS);

export default router;