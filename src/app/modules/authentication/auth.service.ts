/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unsafe-optional-chaining */
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';

import { sendEmail } from '../../utils/sendEmail';
import {
  TChangePasswordData,
  TDecodedShopkeeper,
  TLastPassword,
  TShopkeeper,
  TShopkeeperProfileDataToBeUpdated,
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

  if (shopkeeperFromDB?.email === 'xpawal@gmail.com') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Password change is not allowed for this demo account',
    );
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
    // throw new JsonWebTokenError('Unauthorized Access!');
    return {
      statusCode: 406,
      status: 'failed',
      message: 'Recent password change detected.',
    };
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

  if (newPassword.length < 6 || !/\d/.test(newPassword)) {
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

  if (!result) {
    throw new Error('Password change failed');
  }

  const modifiedResult = {
    _id: result?._id,
    name: result?.name,
    email: result?.email,
    role: result?.role,
  };

  return modifiedResult;
};

//forgot password
const forgetPasswordInDB = async (shopkeeperEmail: string) => {
  if (!shopkeeperEmail) {
    throw new Error('Invalid email');
  }
  const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(shopkeeperEmail)) {
    throw new Error('Invalid email format');
  }

  if (shopkeeperEmail === 'xpawal@gmail.com') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Password reset is not allowed for this demo account',
    );
  }

  const shopkeeperFromDB = await ShopkeeperModel.findOne({
    email: shopkeeperEmail,
  });
  if (!shopkeeperFromDB) {
    throw new Error('No account found with that email');
  }

  const payload = {
    email: shopkeeperFromDB?.email,
  };
  const resettoken = jwt.sign(payload, config.jwt_access_secret as string, {
    expiresIn: '5m',
  });

  const resetUrl = `${config.client_url}/forgot-password?email=${shopkeeperEmail}&token=${resettoken}`;

  sendEmail(
    shopkeeperFromDB?.email,
    `<p>Click <a href="${resetUrl}" target="_blank">here</a> to reset your password</p> . <br/> <p>If you didn't request a password reset, please ignore this email.After 5 mins, the link will be invalid</p>`,
  );

  return null;
};

// reset forgotten password
const resetForgottenPasswordInDB = async (
  shopkeeperEmail: string,
  resetToken: string,
  newPassword: string,
) => {
  if (!shopkeeperEmail || !resetToken || !newPassword) {
    throw new Error('Invalid data');
  } else if (newPassword.length < 6 || !/\d/.test(newPassword)) {
    throw new Error(
      'New password must be minimum 6 characters and include both letters and numbers',
    );
  } else if (shopkeeperEmail === 'xpawal@gmail.com') {
    throw new Error('Password reset is not allowed for this demo account');
  }

  const shopkeeperFromDB = await ShopkeeperModel.findOne({
    email: shopkeeperEmail,
  });
  if (!shopkeeperFromDB) {
    throw new Error('No account found with that email');
  } else {
    // checking token is valid or not
    let decodedShopkeeper: JwtPayload | string;

    try {
      decodedShopkeeper = jwt.verify(
        resetToken as string,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }

    if (decodedShopkeeper.email !== shopkeeperEmail) {
      throw new Error('Invalid token');
    }

    const shopkeeperFromDB = await ShopkeeperModel.findOne({
      email: shopkeeperEmail,
    });
    if (!shopkeeperFromDB) {
      throw new Error(
        'No account found with that email while resetting password',
      );
    }

    const hashedNewPassword = await bcrypt.hash(
      newPassword,
      Number(config.bcrypt_salt_rounds),
    );

    const result = await ShopkeeperModel.findOneAndUpdate(
      { email: shopkeeperFromDB?.email },
      {
        password: hashedNewPassword,
      },
      {
        new: true,
      },
    );

    if (!result) {
      throw new Error('Password reset failed');
    }

    const modifiedResult = {
      _id: result?._id,
      name: result?.name,
      email: result?.email,
      role: result?.role,
    };

    return modifiedResult;
  }
};

//update shopkeeper profile
const updateShopkeeperProfileInDB = async (
  shopkeeper: TDecodedShopkeeper,
  dataToBeUpdated: TShopkeeperProfileDataToBeUpdated,
) => {
  const shopkeeperFromDB = await ShopkeeperModel.findOne({
    email: shopkeeper?.email,
  });

  if (!shopkeeperFromDB) {
    throw new JsonWebTokenError('Unauthorized Access!');
  }

  const { name, profileImage } = dataToBeUpdated;

  let existingPhotos: string[] = shopkeeperFromDB?.photos as string[];
  if (profileImage) {
    if (existingPhotos?.includes(profileImage)) {
      existingPhotos = shopkeeperFromDB?.photos as string[];
    } else {
      existingPhotos = [...existingPhotos, profileImage as string];
    }
  }

  const result = await ShopkeeperModel.findOneAndUpdate(
    { email: shopkeeperFromDB?.email },
    {
      name: name ? name : shopkeeperFromDB?.name,
      profileImage: profileImage
        ? profileImage
        : shopkeeperFromDB?.profileImage,
      photos: existingPhotos,
    },
    {
      new: true,
    },
  );

  if (!result) {
    throw new Error('Update failed');
  }

  const modifiedResult = {
    _id: result?._id,
    name: result?.name,
    email: result?.email,
    role: result?.role,
    profileImage: result?.profileImage,
  };

  return modifiedResult;
};

// delete a photo from shopkeeper profile
const deleteAPhotoFromShopkeeperProfileInDB = async (
  shopkeeper: TDecodedShopkeeper,
  photoUrl: string,
) => {
  const shopkeeperFromDB = await ShopkeeperModel.findOne({
    email: shopkeeper?.email,
  });

  if (!shopkeeperFromDB) {
    throw new JsonWebTokenError('Unauthorized Access!');
  }

  const existingPhotos: string[] = shopkeeperFromDB?.photos as string[];
  const updatedPhotos = existingPhotos.filter((photo) => photo !== photoUrl);

  const result = await ShopkeeperModel.findOneAndUpdate(
    { email: shopkeeperFromDB?.email },
    {
      photos: updatedPhotos,
    },
    {
      new: true,
    },
  );

  if (!result) {
    throw new Error('Failed to delete photo');
  }

  const modifiedResult = {
    _id: result?._id,
    name: result?.name,
    email: result?.email,
    role: result?.role,
    profileImage: result?.profileImage,
  };

  return modifiedResult;
};

// get shopkeeper by email
const getShopkeeperFromDbByEmail = async (email: string) => {
  if (!email) {
    throw new Error('Email is required');
  } else {
    const shopkeeperFromDB = await ShopkeeperModel.findOne({
      email,
    });
    const modifiedShopkeeper = {
      _id: shopkeeperFromDB?._id,
      name: shopkeeperFromDB?.name,
      email: shopkeeperFromDB?.email,
      role: shopkeeperFromDB?.role,
      profileImage: shopkeeperFromDB?.profileImage,
      isEmailVerified: shopkeeperFromDB?.isEmailVerified,
      photos: shopkeeperFromDB?.photos,
    };

    return modifiedShopkeeper;
  }
};

export const ShopkeeperServices = {
  registerShopkeeperInDB,
  loginShopkeeperInDB,
  verifyToken,
  getAccessTokenByRefreshToken,
  changePasswordInDB,
  forgetPasswordInDB,
  resetForgottenPasswordInDB,
  updateShopkeeperProfileInDB,
  deleteAPhotoFromShopkeeperProfileInDB,
  getShopkeeperFromDbByEmail,
};
