import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { IHotTub } from './HotTub.interface';
import { HotTubService } from './HotTub.service';

export const HotTubController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body as Partial<IHotTub>;
    const data = await HotTubService.createHotTubIntoDB(
      req.user._id.toString(),
      payload,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: 'Hot tub installation request created successfully!',
      data,
    });
  }),

  getMyAll: asyncHandler(async (req: Request, res: Response) => {
    const data = await HotTubService.getMyAllHotTubsFromDB(
      req.user._id.toString(),
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Your hot tub installation requests retrieved successfully!',
      data,
    });
  }),

  getSingle: asyncHandler(async (req: Request, res: Response) => {
    const data = await HotTubService.getSingleHotTubFromDB(
      req.user._id.toString(),
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Hot tub installation request retrieved successfully!',
      data,
    });
  }),

  updateSingle: asyncHandler(async (req: Request, res: Response) => {
    const data = await HotTubService.updateSingleHotTubIntoDB(
      req.user._id.toString(),
      req.params.id as string,
      req.body as Partial<IHotTub>,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Hot tub installation request updated successfully!',
      data,
    });
  }),
};
