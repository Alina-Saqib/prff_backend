import authenticate from '../middleware/authenticateUser';
import express, {Request,Response, NextFunction } from 'express';
const router = express.Router();
import { serviceRequestController ,acceptRequest,serviceFound, serviceRerequestController, cancelRequestController, autoMessages, getServiceRequest, serviceRequestOfProviders, ignoreRequest, emailNotificationToReRequest} from '../controller/ServiceRequestController';
import { getCategory } from '../controller/CategoryController';
import User from '../model/UserSchema';
import ServiceProvider from '../model/ServiceProviderSchema';
import QuickResponse from '../model/ResponsesSchema';
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

router.get('/category', getCategory)

router.get('/re-request-email',emailNotificationToReRequest)


router.post('/addQuickResponsesToAll', async (req: Request, res: Response) => {
    try {
      const users = await User.findAll(); // Fetch all users
      const providers = await ServiceProvider.findAll(); // Fetch all providers

      const userPredefinedResponses = [
        { message: 'I am Looking for someone to do some work in _____ as soon as possible when you are free to give me estimate.' },
    
     
      ];
  
      const providerPredefinedResponses = [
        { message: 'I understand you are looking for a _____ for some work to be done.' },
        
      ];
  
      const addUserPredefinedResponses = async (userId: any, predefinedResponses: any) => {
        try {
          // Assuming QuickResponse is the model representing the user's quick responses
          for (const response of predefinedResponses) {
            await QuickResponse.create({ userId, message: response.message });
          }
        } catch (error) {
          console.error('Error adding predefined responses to user:', error);
          throw error;
        }
      };
      
      const addProviderPredefinedResponses = async (providerId: any, predefinedResponses:any) => {
        try {
          // Assuming ProviderQuickResponse is the model representing the provider's quick responses
          for (const response of predefinedResponses) {
            await QuickResponse.create({ providerId, message: response.message });
          }
        } catch (error) {
          console.error('Error adding predefined responses to provider:', error);
          throw error;
        }
      };
      // Loop through users and providers to add predefined responses
      for (const user of users) {
        await addUserPredefinedResponses(user.roleId, userPredefinedResponses);
      }
  
      for (const provider of providers) {
        await addProviderPredefinedResponses(provider.roleId, providerPredefinedResponses);
      }
  
      res.status(200).json({ success: true, message: 'Predefined responses added to users and providers' });
    } catch (error) {
      console.error('Error adding predefined responses:', error);
      res.status(500).json({ success: false, message: 'Error adding predefined responses' });
    }
  });

export default router;