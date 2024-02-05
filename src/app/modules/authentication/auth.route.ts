import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ShopkeeperControllers } from './auth.controller';
import {
  changePasswordSchema,
  loginSchema,
  signupSchema,
} from './auth.validation';

const router = express.Router();

router.post(
  '/register',
  validateRequest(signupSchema),
  ShopkeeperControllers.registerShopkeeper,
);

router.post(
  '/login',
  validateRequest(loginSchema),
  ShopkeeperControllers.loginShopkeeper,
);

router.post(
  '/change-password',
  validateRequest(changePasswordSchema),
  ShopkeeperControllers.changePassword,
);

router.post('/verify-token', ShopkeeperControllers.verifyToken);

router.post(
  '/refresh-token',
  ShopkeeperControllers.getAccessTokenUsingRefreshToken,
);

export const AuthRoutes = router;
