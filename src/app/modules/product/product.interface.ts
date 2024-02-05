/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export type TProduct = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  bloomdate: string;
  discount: string;
  type: string;
  fragrance: string;
  colors: string[];
  sizes: string[];
  arrangementStyles: string[];
  occasions: string[];
  createdBy?: Types.ObjectId;
  creatorsEmail?: string;
};

//for creating statics
export interface TProductModel extends Model<TProduct> {
  isProductExistsWithSameName(name: string): Promise<TProduct | null>;
}
