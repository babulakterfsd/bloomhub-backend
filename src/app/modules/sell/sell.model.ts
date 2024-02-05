import { Schema, model } from 'mongoose';
import { TSell } from './sell.interface';

const sellSchema = new Schema<TSell>(
  {
    productID: {
      type: Schema.Types.ObjectId,
      ref: 'products',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    quantityToBeSold: {
      type: Number,
      required: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    sellerEmail: {
      type: String,
      required: true,
    },
    dateOfSell: {
      type: String,
      required: true,
    },
    totalBill: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const SellModel = model<TSell>('sells', sellSchema);
