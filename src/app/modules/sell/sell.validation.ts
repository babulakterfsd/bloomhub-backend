import { z } from 'zod';

export const sellSchema = z.object({
  productID: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  productName: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  productPrice: z.number({
    invalid_type_error: ' must be number',
    required_error: ' is required',
  }),
  quantityToBeSold: z.number({
    invalid_type_error: ' must be number',
    required_error: ' is required',
  }),
  buyerName: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  sellerEmail: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  dateOfSell: z.string({
    invalid_type_error: ' must be string',
    required_error: ' is required',
  }),
  totalBill: z.number({
    invalid_type_error: ' must be number',
    required_error: ' is required',
  }),
});
