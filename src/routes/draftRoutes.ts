
import { deleteDraft, deletePhoneDraft, getDraft, getDraftById, getPhoneDraft, getPhoneDraftById, saveDraft, savePhoneDraft, updateDraft, updatePhoneDraft } from '../AdminController/draftController';
import express from 'express';



const router = express.Router();

router.post('/save', saveDraft)
router.get('/', getDraft);
router.get('/getByid/:id', getDraftById);
router.put('/update/:id', updateDraft);
router.delete('/delete/:id', deleteDraft)


//phone-routes
router.post('/phone-save',savePhoneDraft);
router.get('/phone', getPhoneDraft);
router.get('/phone-getByid/:id', getPhoneDraftById);
router.put('/phone-update/:id', updatePhoneDraft);
router.delete('/phone-delete/:id', deletePhoneDraft)

export default router;