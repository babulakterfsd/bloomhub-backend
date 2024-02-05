import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SellControllers } from './sell.controller';
import { sellSchema } from './sell.validation';

const router = express.Router();

router.post(
  '/',
  auth('shopkeeper'),
  validateRequest(sellSchema),
  SellControllers.createSell,
);

router.get('/', auth('shopkeeper'), SellControllers.getAllSells);

export const SellsRoutes = router;
