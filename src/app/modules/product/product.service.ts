import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TProduct } from './product.interface';
import { ProductModel } from './product.model';

//create product in DB
const createProductInDB = async (product: TProduct) => {
  if (product?.quantity < 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Quantity should be equal or greater than 1',
    );
  } else if (product?.price < 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Price should be equal or greater than 1',
    );
  }

  const result = await ProductModel.create(product);

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create course');
  } else {
    return result;
  }
};

//get all products from DB
const getAllProductsFromDB = async (query: any) => {
  const {
    page,
    limit,
    shopkeepersEmail,
    search,
    sortBy,
    sortOrder,
    minPrice,
    maxPrice,
    bloomDateFrom,
    bloomDateTo,
    color,
    type,
    size,
    fragrance,
    arrangementStyle,
    occasion,
  } = query;

  const totalDocs = await ProductModel.countDocuments({
    creatorsEmail: shopkeepersEmail,
  });

  const meta = {
    page: Number(page) || 1,
    limit: Number(limit) || 5,
    total: totalDocs,
  };

  //implement pagination
  const pageToBeFetched = Number(page) || 1;
  const limitToBeFetched = Number(limit) || 5;
  const skip = (pageToBeFetched - 1) * limitToBeFetched;

  //sort
  const sortCheck: Record<string, 1 | -1> = {};

  if (sortBy && ['price', 'quantity'].includes(sortBy)) {
    sortCheck[sortBy] = sortOrder === 'desc' ? -1 : 1;
  }

  // filter
  const filter: Record<string, any> = {};

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) {
      filter.price.$gte = Number(minPrice);
    }
    if (maxPrice) {
      filter.price.$lte = Number(maxPrice);
    }
  }

  if (color) {
    filter.colors = new RegExp(color, 'i');
  }

  if (bloomDateFrom || bloomDateTo) {
    filter.bloomdate = {};
    if (bloomDateFrom) {
      filter.bloomdate.$gte = bloomDateFrom;
    }
    if (bloomDateTo) {
      filter.bloomdate.$lte = bloomDateTo;
    }
  }

  if (type) {
    filter.type = new RegExp(type, 'i');
  }

  if (size) {
    filter.sizes = new RegExp(size, 'i');
  }

  if (fragrance) {
    filter.fragrance = new RegExp(fragrance, 'i');
  }

  if (arrangementStyle) {
    filter.arrangementStyles = new RegExp(arrangementStyle, 'i');
  }

  if (occasion) {
    filter.occasions = new RegExp(occasion, 'i');
  }

  if (shopkeepersEmail) {
    filter.creatorsEmail = shopkeepersEmail;
  }

  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { type: new RegExp(search, 'i') },
    ];
  }

  filter.quantity = { $gte: 1 };

  //fetch products
  const result = await ProductModel.find(filter)
    // .sort(sortCheck)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitToBeFetched);

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to get courses');
  } else {
    return {
      meta,
      data: result,
    };
  }
};

//get single product from DB
const getSingleProductFromDB = async (productId: string) => {
  const isProductExists = await ProductModel.findById({ _id: productId });
  if (!isProductExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Product does not exist');
  }

  const product = await ProductModel.findById({ _id: productId });

  if (!product || product?.quantity < 1) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Product not found');
  }

  return product;
};

//update a product in DB
const updateAProductInDB = async (
  productId: string,
  updatedProductData: TProduct,
) => {
  const productExists = await ProductModel.findById({ _id: productId });

  if (!productExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'ProductId does not exist');
  }

  if (updatedProductData?.quantity < 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Quantity should be equal or greater than 1',
    );
  } else if (updatedProductData?.price < 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Price should be equal or greater than 1',
    );
  }

  const result = await ProductModel.findByIdAndUpdate(
    { _id: productId },
    updatedProductData,
    { new: true },
  );

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update product');
  } else {
    return result;
  }
};

//delete a product from DB
const deleteAProductFromDB = async (productId: string) => {
  const productExists = await ProductModel.findById({ _id: productId });

  if (!productExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'ProductId does not exist');
  }

  const result = await ProductModel.findByIdAndDelete({ _id: productId });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete product');
  } else {
    return result;
  }
};

// delete multiple products
const deleteMultipleProducts = async (productIds: string[]) => {
  const result = await ProductModel.deleteMany({ _id: { $in: productIds } });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete products');
  } else {
    return result;
  }
};

export const ProductServices = {
  createProductInDB,
  getAllProductsFromDB,
  getSingleProductFromDB,
  updateAProductInDB,
  deleteAProductFromDB,
  deleteMultipleProducts,
};
