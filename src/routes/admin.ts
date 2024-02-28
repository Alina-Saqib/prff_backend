
import { getAllServiceRequest, setExpiredHoursForRequest, setExpiryDateOfRequest } from '../AdminController/adminSetting';
import express from 'express'



const router = express.Router();


router.post('/set-expiredHours', setExpiredHoursForRequest)
router.get('/allServiceRequest', getAllServiceRequest)
router.post('/set-expiryDays/:id',setExpiryDateOfRequest)

export default router;