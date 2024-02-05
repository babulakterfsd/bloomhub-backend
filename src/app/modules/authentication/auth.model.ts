import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../../config';
import { TShopkeeper, TShopkeeperModel } from './auth.interface';

const shopkeeperSchema = new Schema<TShopkeeper, TShopkeeperModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      validate: {
        validator: (value: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password should be at least 6 characters long'],
      validate: {
        validator: (value: string) => {
          // Password must contain at least one letter and one numeric character
          const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])/;
          return passwordRegex.test(value);
        },
        message: () =>
          'Password should contain at least one letter and one numeric character',
      },
    },
    role: {
      type: String,
      enum: {
        values: ['shopkeeper'],
        message:
          '{VALUE} is not a valid role. Only "shopkeeper" is allowed as role',
      },
      default: 'shopkeeper',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
      },
    },
  },
);

// hashing the password before saving it to the database
shopkeeperSchema.pre<TShopkeeper>('save', async function (next) {
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
  );

  next();
});

// another layer of making sure that the password is not returned in the response
shopkeeperSchema.post<TShopkeeper>('save', function (doc, next) {
  doc.password = '';

  next();
});

//custom static method to check if the shopkeeper exists or not
shopkeeperSchema.statics.isShopkeeperExistsWithEmail = async function (
  email: string,
) {
  const shopkepperFoundWithEmail = await ShopkeeperModel.findOne({ email });
  return shopkepperFoundWithEmail;
};

export const ShopkeeperModel = model<TShopkeeper, TShopkeeperModel>(
  'shopkeepers',
  shopkeeperSchema,
);
