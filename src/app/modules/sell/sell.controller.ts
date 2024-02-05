import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SellServices } from './sell.service';

//create sell
const createSell = catchAsync(async (req, res) => {
  const result = await SellServices.createSellInDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Product sold successfully',
    data: result,
  });
});

// get all sells
const getAllSells = catchAsync(async (req, res) => {
  const result = await SellServices.getAllSellsFromDB(req.query as any);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All sells data retrieved successfully',
    data: result,
  });
});

export const SellControllers = {
  createSell,
  getAllSells,
};
