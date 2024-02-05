/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unsafe-optional-chaining */
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import {
  TChangePasswordData,
  TDecodedShopkeeper,
  TLastPassword,
  TShopkeeper,
} from './auth.interface';
import { ShopkeeperModel } from './auth.model';

//create shopkeeper in DB
const registerShopkeeperInDB = async (shopkeeper: TShopkeeper) => {
  const isShopkeeperExistsWithEmail =
    await ShopkeeperModel.isShopkeeperExistsWithEmail(shopkeeper?.email);

  if (isShopkeeperExistsWithEmail) {
    throw new Error(
      'Shopkeeper with this email already exists, please try with different  email.',
    );
  } else {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // transaction - 1
      const newShopkeeper = await ShopkeeperModel.create([shopkeeper], {
        session,
      });

      await session.commitTransaction();
      await session.endSession();

      if (newShopkeeper.length < 1) {
        throw new Error('Shopkeeper registration failed');
      }

      return newShopkeeper[0];
    } catch (err: any) {
      await session.abortTransaction();
      await session.endSession();
      throw new Error(err);
    }
  }
};

// login shopkeeper in DB
const loginShopkeeperInDB = async (shopkeeper: TShopkeeper) => {
  const shopkeeperFromDB = await ShopkeeperModel.isShopkeeperExistsWithEmail(
    shopkeeper?.email,
  );
  if (!shopkeeperFromDB) {
    throw new Error('No shopkeeper found with this email');
  }
  const isPasswordMatched = await bcrypt.compare(
    shopkeeper?.password,
    shopkeeperFromDB.password,
  );
  if (!isPasswordMatched) {
    throw new Error('Incorrect password');
  }

  //create token and send it to client side
  const payload = {
    _id: shopkeeperFromDB?._id,
    name: shopkeeperFromDB?.name,
    email: shopkeeperFromDB?.email,
    role: shopkeeperFromDB?.role,
  };

  const accesstoken = jwt.sign(payload, config.jwt_access_secret as string, {
    expiresIn: config.jwt_access_expires_in,
  });

  const refreshfToken = jwt.sign(payload, config.jwt_refresh_secret as string, {
    expiresIn: config.jwt_refresh_expires_in,
  });

  return {
    accesstoken,
    refreshfToken,
    shopkeeperFromDB,
  };
};

//verify token from client side
const verifyToken = async (token: string) => {
  if (!token) {
    return false;
  }

  // checking token is valid or not
  let decodedShopkeeper: JwtPayload | string;

  try {
    decodedShopkeeper = jwt.verify(
      token as string,
      config.jwt_access_secret as string,
    ) as JwtPayload;
  } catch (error) {
    return false;
  }

  const { email } = decodedShopkeeper as JwtPayload;

  // checking if the shopkeeper exists
  const shopkeeper = await ShopkeeperModel.isShopkeeperExistsWithEmail(email);

  if (!shopkeeper) {
    return false;
  }

  return true;
};

//generate refresh token
const getAccessTokenByRefreshToken = async (token: string) => {
  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Refresh token is required');
  }

  // checking token is valid or not
  let decodedShopkeeper: JwtPayload | string;

  try {
    decodedShopkeeper = jwt.verify(
      token as string,
      config.jwt_refresh_secret as string,
    ) as JwtPayload;
  } catch (error) {
    throw new JsonWebTokenError('Unauthorized Access!');
  }

  const { _id, name, role, email } = decodedShopkeeper as JwtPayload;

  // checking if the shopkeeper exists
  const shopkeeper = await ShopkeeperModel.isShopkeeperExistsWithEmail(email);

  if (!shopkeeper) {
    throw new AppError(httpStatus.NOT_FOUND, 'Unauthorized Access!');
  }

  const payload = {
    _id,
    name,
    role,
    email,
  };

  const accessToken = jwt.sign(payload, config.jwt_access_secret as string, {
    expiresIn: config.jwt_access_expires_in,
  });

  return {
    accessToken,
  };
};

// change password
const changePasswordInDB = async (
  passwordData: TChangePasswordData,
  shopkeeper: TDecodedShopkeeper,
) => {
  const { currentPassword, newPassword } = passwordData;

  // check if the shopkeeper exists in the database
  const shopkeeperFromDB = await ShopkeeperModel.findOne({
    email: shopkeeper?.email,
  });
  if (!shopkeeperFromDB) {
    throw new JsonWebTokenError('Unauthorized Access!');
  }

  const currentAccesstokenIssuedAt = shopkeeper?.iat * 1000;

  let lastPasswordChangedAt: Date | number = shopkeeperFromDB
    ?.lastTwoPasswords?.[1]?.changedAt
    ? (shopkeeperFromDB?.lastTwoPasswords?.[1]?.changedAt as Date)
    : (shopkeeperFromDB?.lastTwoPasswords?.[0]?.changedAt as Date);

  //convert lastPasswordChangedAt to miliseconds
  lastPasswordChangedAt = new Date(lastPasswordChangedAt as Date).getTime();

  if (shopkeeperFromDB?.lastTwoPasswords?.length === 0) {
    lastPasswordChangedAt = (shopkeeperFromDB?.createdAt as Date).getTime();
  }

  if (currentAccesstokenIssuedAt < lastPasswordChangedAt) {
    throw new JsonWebTokenError('Unauthorized Access!');
  }

  // check if the current password the shopkeeper gave is correct
  const isPasswordMatched = await bcrypt.compare(
    currentPassword,
    shopkeeperFromDB.password,
  );
  if (!isPasswordMatched) {
    throw new Error('Current password does not match');
  }

  // Check if new password is the same as the current one
  const isSameAsCurrent = currentPassword === newPassword;
  if (isSameAsCurrent) {
    throw new Error('New password must be different from the current password');
  }

  // Check if the new password is the same as the last two passwords
  const isSameAsLastTwoPasswords = shopkeeperFromDB?.lastTwoPasswords?.some(
    (password: TLastPassword) => {
      return bcrypt.compareSync(newPassword, password.oldPassword);
    },
  );

  if (isSameAsLastTwoPasswords) {
    const lastUsedDate = shopkeeperFromDB?.lastTwoPasswords?.[0]?.changedAt;
    const formattedLastUsedDate = lastUsedDate
      ? new Date(lastUsedDate).toLocaleString()
      : 'unknown';

    throw new Error(
      `Password change failed. Ensure the new password is unique and not among the last 2 used (last used on ${formattedLastUsedDate}).`,
    );
  }

  // Check if the new password meets the minimum requirements
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!newPassword.match(passwordRegex)) {
    throw new Error(
      'New password must be minimum 6 characters and include both letters and numbers',
    );
  }

  // Update the password and keep track of the last two passwords
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  const newLastTwoPasswords = () => {
    if (shopkeeperFromDB?.lastTwoPasswords?.length === 0) {
      return [
        { oldPassword: shopkeeperFromDB?.password, changedAt: new Date() },
      ];
    } else if (shopkeeperFromDB?.lastTwoPasswords?.length === 1) {
      return [
        ...shopkeeperFromDB?.lastTwoPasswords,
        { oldPassword: shopkeeperFromDB?.password, changedAt: new Date() },
      ];
    } else if (shopkeeperFromDB?.lastTwoPasswords?.length === 2) {
      return [
        shopkeeperFromDB?.lastTwoPasswords[1],
        { oldPassword: shopkeeperFromDB?.password, changedAt: new Date() },
      ];
    }
  };

  const result = await ShopkeeperModel.findOneAndUpdate(
    { email: shopkeeperFromDB?.email },
    {
      password: hashedNewPassword,
      lastTwoPasswords: newLastTwoPasswords(),
    },
    {
      new: true,
    },
  );

  return result;
};

export const ShopkeeperServices = {
  registerShopkeeperInDB,
  loginShopkeeperInDB,
  verifyToken,
  getAccessTokenByRefreshToken,
  changePasswordInDB,
};
