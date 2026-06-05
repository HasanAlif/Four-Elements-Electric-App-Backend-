import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { IRemodeling } from './Remodeling.interface';
import { RemodelingService } from './Remodeling.service';

export const RemodelingController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body as Partial<IRemodeling>;
    const data = await RemodelingService.createRemodelingIntoDB(
      req.user._id.toString(),
      payload,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: 'Remodeling request created successfully!',
      data,
    });
  }),

  getMyAll: asyncHandler(async (req: Request, res: Response) => {
    const data = await RemodelingService.getMyAllRemodelingsFromDB(
      req.user._id.toString(),
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Your remodeling requests retrieved successfully!',
      data,
    });
  }),

  getSingle: asyncHandler(async (req: Request, res: Response) => {
    const data = await RemodelingService.getSingleRemodelingFromDB(
      req.user._id.toString(),
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Remodeling request retrieved successfully!',
      data,
    });
  }),

  updateSingle: asyncHandler(async (req: Request, res: Response) => {
    const data = await RemodelingService.updateSingleRemodelingIntoDB(
      req.user._id.toString(),
      req.params.id as string,
      req.body as Partial<IRemodeling>,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Remodeling request updated successfully!',
      data,
    });
  }),
};
