import authenticate from '../middleware/authenticateUser';
import { fetchChat, messageController, messageFetchController } from '../controller/ChatController';
import express from 'express';


const router = express.Router();



router.use(authenticate);

router.get('/fetch', fetchChat);


router.post('/message' ,messageController)


router.get('/:chatId/messages', messageFetchController);



export default router;