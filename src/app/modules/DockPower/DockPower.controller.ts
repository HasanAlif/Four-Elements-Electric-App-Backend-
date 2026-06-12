import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { IDockPower } from './DockPower.interface';
import { DockPowerService } from './DockPower.service';

export const DockPowerController = {
  createDockPower: asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body as Partial<IDockPower>;
    const data = await DockPowerService.createDockPowerIntoDB(
      req.user._id.toString(),
      payload,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: 'Dock power request created successfully!',
      data,
    });
  }),

  getAllDockPowers: asyncHandler(async (req: Request, res: Response) => {
    const data = await DockPowerService.getAllDockPowersFromDB();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Dock power requests retrieved successfully!',
      data,
    });
  }),

  getMyAllDockPowers: asyncHandler(async (req: Request, res: Response) => {
    const data = await DockPowerService.getMyAllDockPowersFromDB(
      req.user._id.toString(),
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Your dock power requests retrieved successfully!',
      data,
    });
  }),

  getSingleDockPower: asyncHandler(async (req: Request, res: Response) => {
    const data = await DockPowerService.getSingleDockPowerFromDB(
      req.user._id.toString(),
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Dock power request retrieved successfully!',
      data,
    });
  }),

  updateSingleDockPower: asyncHandler(async (req: Request, res: Response) => {
    const data = await DockPowerService.updateSingleDockPowerIntoDB(
      req.user._id.toString(),
      req.params.id as string,
      req.body as Partial<IDockPower>,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Dock power request updated successfully!',
      data,
    });
  }),
};
