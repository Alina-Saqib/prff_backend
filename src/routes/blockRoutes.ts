import express from 'express';
import { blockUser, unblockUser } from '../controller/BlockController';
import authenticate from '../middleware/authenticateUser';

const router = express.Router();

router.use(authenticate);

router.post('/block', blockUser);
router.delete('/unblock', unblockUser);

export default router;
