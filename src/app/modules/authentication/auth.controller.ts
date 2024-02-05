import httpStatus from 'http-status';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ShopkeeperServices } from './auth.service';

//create shopkeeper
const registerShopkeeper = catchAsync(async (req, res) => {
  const result = await ShopkeeperServices.registerShopkeeperInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Shopkeeper has been registered succesfully',
    data: result,
  });
});

//login shopkeeper
const loginShopkeeper = catchAsync(async (req, res) => {
  const result = await ShopkeeperServices.loginShopkeeperInDB(req.body);
  const { accesstoken, refreshfToken, shopkeeperFromDB } = result;

  res.cookie('refreshfToken', refreshfToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shopkeeper has been logged in succesfully',
    data: {
      shopkeeper: {
        _id: shopkeeperFromDB?._id,
        name: shopkeeperFromDB?.name,
        email: shopkeeperFromDB?.email,
        role: shopkeeperFromDB?.role,
      },
      token: accesstoken,
    },
  });
});

// verify token from client side
const verifyToken = catchAsync(async (req, res) => {
  const result = await ShopkeeperServices.verifyToken(req.body.token);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Token verification completed!',
    data: result,
  });
});

//get access token using refresh token
const getAccessTokenUsingRefreshToken = catchAsync(async (req, res) => {
  const result = await ShopkeeperServices.getAccessTokenByRefreshToken(
    req.cookies?.refreshfToken,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token retrieved succesfully!',
    data: result,
  });
});

export const ShopkeeperControllers = {
  registerShopkeeper,
  loginShopkeeper,
  verifyToken,
  getAccessTokenUsingRefreshToken,
};
