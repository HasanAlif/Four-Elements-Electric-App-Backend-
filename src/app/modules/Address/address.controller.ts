import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { AddressService } from './address.service';
import { IAddress } from './address.interface';

export const AddressController = {
  // getMyAllAddresses
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

  // getSingleAddress
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

  // updateSingleAddress
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

  // deleteSingleAddress
  deleteSingleAddress: asyncHandler(async (req: Request, res: Response) => {
    const data = await AddressService.deleteSingleAddressFromDB(
      req.user._id.toString(),
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Address deleted successfully!',
      data,
    });
  }),
};
