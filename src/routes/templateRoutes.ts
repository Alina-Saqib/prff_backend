import { deletePhonetemplate, deletetemplate, getPhonetemplateById, getPhonetemplates, gettemplateById, gettemplates, savePhonetemplate, savetemplate, updatePhonetemplate, updatetemplate } from '../AdminController/templateController';
import express from 'express';



const router = express.Router();

router.post('/save', savetemplate)
router.get('/', gettemplates);
router.get('/getByid/:id', gettemplateById);
router.put('/update/:id', updatetemplate);
router.delete('/delete/:id', deletetemplate)


//phone templates Routes

router.post('/phone-save', savePhonetemplate)
router.get('/phone', getPhonetemplates);
router.get('/phone-getByid/:id', getPhonetemplateById);
router.put('/phone-update/:id', updatePhonetemplate);
router.delete('/phone-delete/:id', deletePhonetemplate)

export default router;