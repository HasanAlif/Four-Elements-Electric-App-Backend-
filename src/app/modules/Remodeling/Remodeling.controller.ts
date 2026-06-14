import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { IRemodeling } from './Remodeling.interface';
import { RemodelingService } from './Remodeling.service';

export const RemodelingController = {
  createRemodeling: asyncHandler(async (req: Request, res: Response) => {
    const data = await RemodelingService.createRemodelingIntoDB(
      req.user,
      req.body,
      req.files,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: 'Remodeling request created successfully!',
      data,
    });
  }),

  getAllRemodelings: asyncHandler(async (req: Request, res: Response) => {
    const data = await RemodelingService.getAllRemodelingsFromDB();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'All remodeling requests retrieved successfully!',
      data,
    });
  }),

  getMyAllRemodelings: asyncHandler(async (req: Request, res: Response) => {
    const data = await RemodelingService.getMyAllRemodelingsFromDB(
      req.user._id.toString(),
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Your remodeling requests retrieved successfully!',
      data,
    });
  }),

  getSingleRemodeling: asyncHandler(async (req: Request, res: Response) => {
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

  updateSingleRemodeling: asyncHandler(async (req: Request, res: Response) => {
    const data = await RemodelingService.updateSingleRemodelingIntoDB(
      req.user._id.toString(),
      req.params.id as string,
      req.body as Partial<IRemodeling>,
      req.files,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Remodeling request updated successfully!',
      data,
    });
  }),

  deleteSingleRemodeling: asyncHandler(async (req: Request, res: Response) => {
    const data = await RemodelingService.deleteSingleRemodelingFromDB(
      req.user._id.toString(),
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Remodeling request deleted successfully!',
      data,
    });
  }),
};
