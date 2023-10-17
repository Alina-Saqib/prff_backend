import { serviceProviderRegistration  } from '../controller/ServiceProviderRegistration';
import { UserRegistration } from '../controller/UserRegistration';
import { loginController, ResendVerificationEmail, verificationLink, VerifyUser } from '../controller/LoginController';
import { check } from 'express-validator';
import express from 'express';
import { forgetPassword, ResetPassword } from '../controller/forgetController';
const router = express.Router();



router.post('/user-registration' ,
  [
    check('name', 'name is required').notEmpty(),
    check('surname', 'Email is required').notEmpty(),
    check('email', 'email is required').isEmail(),
    check('phone', 'phone Number is required').notEmpty(),
    check('gender', 'gender is required').notEmpty(),
    check('zipCode', 'zipCode is required').notEmpty(),
    check('password', 'password is required').notEmpty(),
  ], UserRegistration);


router.post('/serviceProvider-registration',  [
    check('business', 'business is required').notEmpty(),
    check('email', 'email is required').isEmail(),
    check('category', 'category is required').notEmpty(),
    check('phone', 'phone Number is required').notEmpty(),
    check('service', 'service is required').notEmpty(),
    check('zipCode', 'zipCode is required').notEmpty(),
    check('password', 'password is required').notEmpty(),
  ],serviceProviderRegistration ) ;



router.post(
    '/login',
    [
      check('email', 'Email is required').isEmail(),
      check('password', 'Password is required').notEmpty(),
    ],

   loginController

);

router.post(
    '/email-verification',
    

    VerifyUser
);

router.post('/resend-verification-email', ResendVerificationEmail);

router.get('/verify', verificationLink);
router.post('/forget-password' ,forgetPassword)
router.post('/password-reset' ,ResetPassword)
export default router;