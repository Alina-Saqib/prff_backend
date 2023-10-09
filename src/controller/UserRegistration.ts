import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../model/UserSchema';

export const UserRegistration = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, surname, email, phone, gender, zipCode, password, confirmPassword } = req.body;

 
  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  if (password === confirmPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
     
      const newUser = await User.create({
        name,
        surname,
        email,
        phone,
        gender,
        zipCode,
        password: hashedPassword,
        verify: false,
      });

      res.status(201).json({ message: 'User registered successfully'});
    } catch (error) {
      res.status(500).json({ error: 'Error registering user' });
    }
  } else {
    res.status(400).json({ error: 'Password and confirm Password do not match' });
  }
};
