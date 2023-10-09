import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import ServiceProvider from '../model/ServiceProviderSchema'; 

export const serviceProviderRegistration = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { business, email, category, phone, service, zipCode, password, confirmPassword } = req.body;

 
  const existingServiceProvider = await ServiceProvider.findOne({ where: { email } });

  if (existingServiceProvider) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  if (password === confirmPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      // Create a new service provider using the Sequelize ServiceProvider model
      const newServiceProvider = await ServiceProvider.create({
        business,
        email,
        category,
        phone,
        service,
        zipCode,
        password: hashedPassword,
        verify: false,
      });

      res.status(201).json({ message: 'Service provider registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error registering service provider' });
    }
  } else {
    res.status(400).json({ error: 'Password and confirm Password do not match' });
  }
};
