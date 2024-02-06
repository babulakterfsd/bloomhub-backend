import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ShopkeeperControllers } from './auth.controller';
import {
  loginSchema,
  signupSchema,
  updateProfileSchema,
} from './auth.validation';

const router = express.Router();

router.get(
  '/get-profile',
  auth('shopkeeper'),
  ShopkeeperControllers.getShopkeeperProfile,
);

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
  // validateRequest(changePasswordSchema),
  ShopkeeperControllers.changePassword,
);

router.put(
  '/update-profile',
  validateRequest(updateProfileSchema),
  ShopkeeperControllers.updateShopkeeperProfile,
);

router.post('/verify-token', ShopkeeperControllers.verifyToken);

router.post(
  '/refresh-token',
  ShopkeeperControllers.getAccessTokenUsingRefreshToken,
);

export const AuthRoutes = router;
