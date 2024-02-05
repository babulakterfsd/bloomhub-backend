import { Router } from 'express';

import { AuthRoutes } from '../modules/authentication/auth.route';
import { ProductRoutes } from '../modules/product/product.route';
import { SellsRoutes } from '../modules/sell/sell.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/products',
    route: ProductRoutes,
  },
  {
    path: '/sells',
    route: SellsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
