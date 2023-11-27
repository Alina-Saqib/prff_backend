import authenticate from '../middleware/authenticateUser';
import express, {Request,Response, NextFunction } from 'express';
const router = express.Router();
import { UsersRequests,serviceRequestController ,emailNotificationToReRequest,acceptRequest,serviceFound, serviceRerequestController, cancelRequestController, autoMessages, getServiceRequest, serviceRequestOfProviders, ignoreRequest} from '../controller/ServiceRequestController';
import { getCategory } from '../controller/CategoryController';
router.get('/auto-messages' , autoMessages)
router.get('/category', getCategory)

router.use(authenticate);

router.use(authenticate);

router.post('/request', serviceRequestController)


router.post('/accept-request/:messageId' ,acceptRequest)

router.post('/ignore-request/:messageId' ,ignoreRequest)

router.post('/mark-service-found' , serviceFound)




router.get('/get-request' , getServiceRequest)

router.get('/provider-request' , serviceRequestOfProviders)
router.get('/getuser-request' , UsersRequests)
router.post('/cancel-request' , cancelRequestController)
router.post('/re-request' , serviceRerequestController)

router.post('/re-request-email',emailNotificationToReRequest)

export default router;
