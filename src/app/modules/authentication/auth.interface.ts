/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

export type TLastPassword = {
  oldPassword: string;
  changedAt: Date;
};

export type TChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export type TShopkeeper = {
  _id: string;
  name: string;
  email: string;
  isEmailVerified: string;
  password: string;
  role: 'shopkeeper';
  lastTwoPasswords?: TLastPassword[];
  profileImage?: string;
  photos?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
};

export type TShopkeeperProfileDataToBeUpdated = {
  name?: string;
  profileImage?: string;
};

export type TShopkeeperRole = 'shopkeeper';

export type TDecodedShopkeeper = {
  _id: string;
  name: string;
  email: string;
  role: 'shopkeeper';
  iat: number;
  exp: number;
};

//for creating statics
export interface TShopkeeperModel extends Model<TShopkeeper> {
  isShopkeeperExistsWithEmail(email: string): Promise<TShopkeeper | null>;
}
