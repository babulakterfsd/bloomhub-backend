import { Schema, model } from 'mongoose';
import { TProduct, TProductModel } from './product.interface';

const productSchema = new Schema<TProduct, TProductModel>(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    quantity: {
      type: Number,
      required: true,
    },
    bloomdate: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    fragrance: {
      type: String,
      required: true,
    },
    colors: {
      type: [String],
      required: true,
    },
    sizes: {
      type: [String],
      required: true,
    },
    arrangementStyles: {
      type: [String],
      required: true,
    },
    occasions: {
      type: [String],
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'shopkeepers',
      required: true,
    },
    creatorsEmail: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

//checking if the product really exists or not with the same name
productSchema.statics.isProductExistsWithSameName = async function (
  productName: string,
) {
  const product = await this.findOne({ name: productName });
  return !!product;
};

export const ProductModel = model<TProduct, TProductModel>(
  'products',
  productSchema,
);
