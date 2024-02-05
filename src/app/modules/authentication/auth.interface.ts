/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

export type TShopkeeper = {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'shopkeeper';
};

export type TShopkeeperRole = 'shopkeeper';

export type TDecodedShopkeeper = {
  _id: string;
  name: string;
  email: string;
  role: 'shopkeeper';
};

//for creating statics
export interface TShopkeeperModel extends Model<TShopkeeper> {
  isShopkeeperExistsWithEmail(email: string): Promise<TShopkeeper | null>;
}
