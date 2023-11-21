import { addResponses, deleteResponses, editResponses, getResponses } from '../controller/ResponsesController';
import authenticate from '../middleware/authenticateUser';
import express from 'express';


const router = express.Router();

router.post('/add' , addResponses);
router.get('/:userId' , getResponses );
router.put('/edit/:id' , editResponses) ;
router.delete('/delete/:id' ,deleteResponses);

router.use(authenticate);




export default router;