import { Request, Response } from 'express';
import { Op } from 'sequelize';
import ServiceProvider from '../model/ServiceProviderSchema'; 
import ServiceRequest from '../model/ServiceRequestSchema'; 
import AutomatedMessages from '../model/automatedMessageSchema';
import Chat from '../model/ChatSchema';

export const serviceRequestController = async (req: Request, res: Response) => {
  const { category, service, description, timeframe, budget, searchRadius } = req.body;
  const userId= req.query.userId;
  
 
  try {
    const newRequest = await ServiceRequest.create({
      userId,
      category,
      service,
      description,
      timeframe,
      budget,
      searchRadius,
      status: 'searching', 
    });
    

    const filter = {
      [Op.or]: [
        category
          ? {
              category: {
                [Op.like]: `%${category.split(' ')[0]}%`,
              },
            }
          : {},
        service
          ? {
              service: {
                [Op.like]: `%${service.split(' ')[0]}%`,
              },
            }
          : {},
      ],
    };
    
    const providers = await ServiceProvider.findAll({ where: filter });
    

    const providersWithScores = providers.map((provider: any) => ({
      ...provider.toJSON(),
      score: calculateSearchScore(provider, req.body),
    }));

    providersWithScores.sort((a: any, b: any) => b.score - a.score);

    const topProviders = providersWithScores.slice(0, 5);

    const topProviderIds = topProviders.map((provider) => provider.roleId);

    await newRequest.update({ topProviderIds: topProviderIds });

    const ServiceRequestResponse ={
      id: newRequest.id,
      category: newRequest.category,
      service: newRequest.service,
      description: newRequest.description,
      timeframe: newRequest.timeframe,
      budget: newRequest.budget,
      customer:  "anonymous customer"

    }

    res.status(200).json({ serviceRequest:ServiceRequestResponse, providerstosendNotification:  topProviderIds});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function calculateSearchScore(provider: any, searchCriteria: any) {
  let score = 0;

  if (provider.isOnline) {
    score += 1;
  }

  const providerCategory = provider.category.toLowerCase();
  const searchCategory = searchCriteria.category.toLowerCase();
  if (providerCategory.includes(searchCategory)) {
    const matchRatio = searchCategory.length / providerCategory.length;
    score += matchRatio;
  }

  const providerService = provider.service.toLowerCase();
  const searchService = searchCriteria.service.toLowerCase();
  if (providerService.includes(searchService)) {
    const matchRatio = searchService.length / providerService.length;
    score += matchRatio;
  }

  return score;
}


export const autoMessages = async (req: Request, res: Response) =>{

  try {
    const messages = await AutomatedMessages.findAll();

    const messagesResponse = messages.map((message) => ({
      id: message.id,
      message: message.MessageText, 
    }));
    res.json(messagesResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const acceptRequest = async (req: Request, res: Response) => {
  try {
    const serviceRequestId = req.query.serviceRequestId;
    const serviceProviderId = req.query.serviceProviderId;
    const messageId = req.params.messageId;

    const serviceRequest = await ServiceRequest.findOne({ where: { id: serviceRequestId } });

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found.' });
    }

    if (serviceRequest.status === 'cancelled' || serviceRequest.status === 'found') {
      return res.status(404).json({ message: 'Request Already Cancelled or found.' });
    }

    const automatedMessage = await AutomatedMessages.findByPk(messageId);
    const arrayAcceptedProvidersIds = JSON.parse( serviceRequest.acceptedProviderIds as any)

    if (serviceRequest.acceptedProviderIds === null ||serviceRequest.acceptedProviderIds === undefined ){
      serviceRequest.acceptedProviderIds = [];
      serviceRequest.acceptedProviderIds.push(serviceProviderId as any)
      await serviceRequest.save();
 }
 
    else if (!arrayAcceptedProvidersIds.includes(serviceProviderId as any)) {
      arrayAcceptedProvidersIds.push(serviceProviderId as string);
      serviceRequest.acceptedProviderIds = arrayAcceptedProvidersIds;
      await serviceRequest.save();
    } else {
      return res.status(400).json({ message: 'Provider already accepted.' });
    }


    const chat = await Chat.findOne({
      where: {
        user1: serviceRequest.userId,
        user2: serviceProviderId,
      },
    });

    if (chat) {
      const newMessage = {
        sender: serviceProviderId,
        text: automatedMessage!.MessageText,
        timestamp: new Date(),
      };

      const messageArray =JSON.parse(chat.messages as any)
      messageArray.push(newMessage);
      chat.messages= messageArray;
      await chat.save();
    } else {
      
      const newChat = await Chat.create({
        user1: serviceRequest.userId,
        user2: serviceProviderId,
        messages: [
          {
            sender: serviceProviderId,
            text: automatedMessage!.MessageText,
            timestamp: new Date(),
          },
        ],
      });
    }
  
    

   

    return res.status(200).json({ message: 'Request accepted.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const serviceFound = async (req: Request, res: Response) => {
  try {
    const serviceRequestId = req.query.serviceRequestId;
    const serviceProviderId = req.query.serviceProviderId as String;
   
    const serviceRequest = await ServiceRequest.findOne({
      where: { id: serviceRequestId },
    });

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found.' });
    }

    if(serviceRequest.status == 'cancelled' || serviceRequest.status == 'found'){
      return res.status(404).json({ message: 'Request Already Cancelled or found' });
  
    }

    const topProviderIdsArray = JSON.parse(serviceRequest.topProviderIds as any);
 
    if (topProviderIdsArray.includes(serviceProviderId)) {
      await serviceRequest.update({
        status: 'found',
        serviceProviderDetailsId: serviceProviderId,
      })
    } 


    const acceptedProvidersIds = JSON.parse(serviceRequest.acceptedProviderIds as any)    
    const acceptProviderIds = acceptedProvidersIds.filter(
        (providerId: any) => providerId != serviceProviderId
      );

      for (const providerId of acceptProviderIds) {
        const chat = await Chat.findOne({
          where: {
            [Op.or]: [
              { user1: providerId, user2: serviceRequest.userId },
              { user1:  serviceRequest.userId, user2: providerId },
            ],
          },
        });
      
        if (chat) {

          const newMessage = {
            sender:  serviceRequest.userId,
            text: 'Service has been found.',
            timestamp: new Date(),
          };
            const arrayChatExist = JSON.parse(chat.messages as any)
            arrayChatExist.push(newMessage as any);
            chat.messages = arrayChatExist;
            await chat.save();
            
        }
      }
   


    
    res.status(200).json({ message: 'Service marked as found.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const serviceRerequestController = async (req: Request, res: Response) => {
  const  serviceRequestId  = req.query.serviceRequestId; 

  try {
   
    const originalRequest = await ServiceRequest.findOne({where: {id: serviceRequestId}});

    if (!originalRequest) {
      return res.status(404).json({ error: 'Original request not found' });
    }

    if(originalRequest.status == 'cancelled' || originalRequest.status == 'found'){
      return res.status(404).json({ message: 'Request Already Cancelled or found' });
  
    }

    const { category, service } = originalRequest;
   

    const existingTopProviderIds = originalRequest.topProviderIds;

   
    const newProviders = await findNewProviders(existingTopProviderIds, { category, service });

    const providersWithScores= newProviders.map((provider: any) => ({
      ...provider.toJSON(),
      score: calculateSearchScore(provider, {category,service}),
    }));

    providersWithScores.sort((a: any, b: any) => b.score - a.score);

    await originalRequest.update({ topProviderIds: providersWithScores.map((provider: any) => provider.roleId) });

    const ServiceRequestResponse ={
      id: originalRequest.id,
      category: originalRequest.category,
      service: originalRequest.service,
      description:originalRequest.description,
      timeframe: originalRequest.timeframe,
      budget: originalRequest.budget,
      customer:  "anonymous customer"

    }

    res.status(200).json({ serviceRequest: ServiceRequestResponse , providerIdstosendNotification: originalRequest.topProviderIds});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


async function findNewProviders(existingTopProviderIds: any, searchCriteria: any) {
  const { category, service } = searchCriteria;

  try {
    const filter = {
      [Op.or]: [
        category
          ? {
              category: {
                [Op.like]: `%${category.split(' ')[0]}%`,
              },
            }
          : {},
        service
          ? {
              service: {
                [Op.like]: `%${service.split(' ')[0]}%`,
              },
            }
          : {},
      ],
    };
   
    const providers = await ServiceProvider.findAll({ where: filter });

    const newProviders = providers.filter((provider: any) => !existingTopProviderIds.includes(provider.roleId));


    const limitedNewProviders = newProviders.slice(0, 5);

    return limitedNewProviders;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


export const cancelRequestController = async (req: Request, res: Response) => {
  const serviceRequestId = req.query.serviceRequestId; 
 

  try {
    const request = await ServiceRequest.findOne({ where: { id: serviceRequestId } });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status === 'found' || request.status === 'cancelled') {
      return res.status(400).json({ error: 'Request cannot be cancelled' });
    }

    await request.update({ status: 'cancelled' });

    if (!request.acceptedProviderIds || request.acceptedProviderIds.length === 0) {
      return res.status(400).json({ error: 'No provider accepted request it is cancelled' });
    }


    const accpetedProvideridsArray = JSON.parse(request.acceptedProviderIds as any);


    
    for (const providerId of accpetedProvideridsArray ) {
      const chatExist = await Chat.findOne({
        where: {
          [Op.or]: [
            { user1: providerId, user2: request.userId },
            { user1:request.userId, user2: providerId },
          ],
        },
      });
    
      if (chatExist) {

        const newMessage = {
          sender: request.userId,
          text: 'Request is Cancenlled',
          timestamp: new Date(),
        };
          const arrayChatExist = JSON.parse(chatExist.messages as any)
          arrayChatExist.push(newMessage as any);
          chatExist.messages = arrayChatExist;
          await chatExist.save();
          
      }
    }

    res.status(200).json({ message: 'Request has been canceled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getServiceRequest = async (req:Request,res: Response) =>{

  const serviceRequestId = req.query.id;

  try{
  const serviceRequest = await ServiceRequest.findByPk(serviceRequestId as any)

  if (!serviceRequest){
    return res.status(403).json({ error: "Service Request not found"})
  }

  const ArrayOfAcceptedRequestIds = JSON.parse(serviceRequest.acceptedProviderIds as any)

  const serviceRequestResponse ={
      id: serviceRequest.id,
      category: serviceRequest.category,
      service: serviceRequest.service,
      description: serviceRequest.description,
      timeframe: serviceRequest.timeframe,
      budget: serviceRequest.budget,
      acceptedProvidersIds : ArrayOfAcceptedRequestIds
   

    }


    return res.status(200).json({serviceRequestResponse})}
    catch(err){
    return res.status(500).json({error: "Internal Server Error "})
  }
    }


export const serviceRequestOfProviders = async (req:Request,res: Response) => {
      const providerId = req.query.providerId;
    
      if (!providerId) {
        return res.status(403).json({ error: "Provider Id not found" });
      }
    
      try {
        const serviceRequests = await ServiceRequest.findAll();
    
        const matchingServiceRequests = serviceRequests.filter(request => {
          const topProviderIds = JSON.parse(request.topProviderIds as any);
          return topProviderIds.includes(providerId);
        });
    
        if (matchingServiceRequests.length === 0) {
          return res.status(404).json({ error: "Service request not found for the providerId" });
        }
    
        const ResponseMatchingService = matchingServiceRequests.map(serviceRequest => ({
          id: serviceRequest.id,
          category: serviceRequest.category,
          service: serviceRequest.service,
          description: serviceRequest.description,
          timeframe: serviceRequest.timeframe,
          budget: serviceRequest.budget,
        }));
    
        return res.status(200).json({ ResponseMatchingService });
    
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    };
    