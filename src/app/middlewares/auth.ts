import { NextFunction, Request, Response } from 'express';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { TShopkeeperRole } from '../modules/authentication/auth.interface';
import { ShopkeeperModel } from '../modules/authentication/auth.model';
import catchAsync from '../utils/catchAsync';

const auth = (...requiredRoles: TShopkeeperRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req?.headers?.authorization?.split(' ')[1];

    if (!token) {
      throw new JsonWebTokenError('Unauthorized Access!');
    }

    // checking token is valid or not
    let decodedShopkeeper: JwtPayload | string;

    try {
      decodedShopkeeper = jwt.verify(
        token as string,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (error) {
      throw new JsonWebTokenError('Unauthorized Access!');
    }

    const { role, email } = decodedShopkeeper as JwtPayload;

    // checking if the shopkeeper exist
    const shopkeeper = await ShopkeeperModel.isShopkeeperExistsWithEmail(email);

    if (!shopkeeper) {
      throw new JsonWebTokenError('Unauthorized Access!');
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new JsonWebTokenError('Unauthorized Access!');
    }

    req.shopkeeper = decodedShopkeeper as JwtPayload & { role: string };
    next();
  });
};

export default auth;
