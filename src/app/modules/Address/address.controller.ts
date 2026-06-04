import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { AddressService } from './address.service';
import { IAddress } from './address.interface';

export const AddressController = {
  createAddress: asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body as Partial<IAddress>;
    const data = await AddressService.createAddressIntoDB(
      req.user._id.toString(),
      payload,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: 'Address created successfully!',
      data,
    });
  }),

  getMyAllAddresses: asyncHandler(async (req: Request, res: Response) => {
    const data = await AddressService.getMyAllAddressesFromDB(
      req.user._id.toString(),
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Your addresses retrieved successfully!',
      data,
    });
  }),

  getSingleAddress: asyncHandler(async (req: Request, res: Response) => {
    const data = await AddressService.getSingleAddressFromDB(
      req.user._id.toString(),
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Address retrieved successfully!',
      data,
    });
  }),

  updateSingleAddress: asyncHandler(async (req: Request, res: Response) => {
    const data = await AddressService.updateSingleAddressIntoDB(
      req.user._id.toString(),
      req.params.id as string,
      req.body as Partial<IAddress>,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Address updated successfully!',
      data,
    });
  }),
};
