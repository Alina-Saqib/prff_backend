import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import User from '../model/UserSchema'; 
import ServiceProvider from '../model/ServiceProviderSchema'; 

export const loginController = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const provider = await ServiceProvider.findOne({ where: { email } });
    const user = await User.findOne({ where: { email } });

    if (provider) {
      const passwordMatch = await bcrypt.compare(password, provider.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      const token = jwt.sign({ providerId: provider.roleId }, process.env.JWT_SECRET as Secret, {
        expiresIn: '7d',
      });

      const providerResponse ={
        id: provider.roleId,
        business: provider.business,
        email: provider.email,
        category: provider.category,
        phone: provider.phone,
        service: provider.service,
        zipCode: provider.zipCode


      }
      
      
      res.json({ message: 'Login successful as provider', provider: providerResponse, token });
    } 

    else if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      const token = jwt.sign({ userId: user.roleId }, process.env.JWT_SECRET as Secret, {
        expiresIn: '7d',
      });

      const userResponse ={
        id: user.roleId,
        name: user.name,
        surname: user.surname,
        email: user.email,
        gender: user.gender,
        phone: user.phone,
        zipCode: user.zipCode


      }

      res.json({ message: 'Login successful as user', userResponse, token });
    } 
      
    else{
    
    return res.status(401).json({ message: 'Email not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// export const loginServiceProvider = async (req: Request, res: Response) => {
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const { email, password } = req.body;
//     const provider = await ServiceProvider.findOne({ where: { email } });

//     if (provider) {
//       const passwordMatch = await bcrypt.compare(password, provider.password);
//       if (!passwordMatch) {
//         return res.status(401).json({ message: 'Incorrect password' });
//       }

//       const token = jwt.sign({ providerId: provider.id }, process.env.JWT_SECRET as Secret, {
//         expiresIn: '7d',
//       });

//       res.json({ message: 'Login successful as provider', provider, token });
//     } else {
//       return res.status(401).json({ message: 'Provider not found' });
//     }
//   } catch (error: any) {
//     res.status(500).json({ message: 'Login failed', error: error.message });
//   }
// };
