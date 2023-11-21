import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import ServiceProvider from '../model/ServiceProviderSchema';
import User from '../model/UserSchema';
import dotenv from 'dotenv';

dotenv.config();

interface CustomRequest extends Request {
  user?: JwtPayload | null; 
}

export default async function authenticate(req: CustomRequest, res: Response, next: NextFunction) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret) as JwtPayload;
    

    if (decoded.providerId) {
      const provider = await ServiceProvider.findByPk(decoded.providerId);
      if (!provider) {
        return res.status(401).json({ msg: 'Provider not found' });
      }
      
      req.user = provider;
    } else if (decoded.userId) {
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.status(401).json({ msg: 'User not found' });
      }
   
      req.user = user;
    } else {
      return res.status(401).json({ msg: 'User or provider not found' });
    }

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}
