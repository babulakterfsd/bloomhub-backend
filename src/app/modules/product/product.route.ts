import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ProductControllers } from './product.controller';
import { productSchema, productUpdateSchema } from './product.validation';

const router = express.Router();

router.get('/:id', auth('shopkeeper'), ProductControllers.getSingleProduct);
router.put(
  '/:id',
  auth('shopkeeper'),
  validateRequest(productUpdateSchema),
  ProductControllers.updateAProduct,
);
router.delete('/:id', auth('shopkeeper'), ProductControllers.deleteAProduct);

router.post(
  '/',
  auth('shopkeeper'),
  validateRequest(productSchema),
  ProductControllers.createProduct,
);

router.get('/', auth('shopkeeper'), ProductControllers.getAllProducts);

router.delete(
  '/',
  auth('shopkeeper'),
  ProductControllers.deleteMultipleProducts,
);

export const ProductRoutes = router;
