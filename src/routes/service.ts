import authenticate from '../middleware/authenticateUser';
import express, {Request,Response, NextFunction } from 'express';
const router = express.Router();
import { serviceRequestController ,acceptRequest,serviceFound, serviceRerequestController, cancelRequestController, autoMessages, getServiceRequest, serviceRequestOfProviders, ignoreRequest} from '../controller/ServiceRequestController';
router.get('/auto-messages' , autoMessages)
router.use(authenticate);

router.post('/request', serviceRequestController)


router.post('/accept-request/:messageId' ,acceptRequest)

router.post('/ignore-request/:messageId' ,ignoreRequest)

router.post('/mark-service-found' , serviceFound)


router.post('/re-request' , serviceRerequestController)

router.get('/get-request' , getServiceRequest)

router.get('/provider-request' , serviceRequestOfProviders)

router.post('/cancel-request' , cancelRequestController)

export default router;