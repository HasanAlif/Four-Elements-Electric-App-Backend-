import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse, AppError } from '../../utils';
import { ServiceCallService } from './ServiceCall.service';
import { IServiceCall } from './ServiceCall.interface';

export const ServiceCallController = {
  // createServiceCall
  createServiceCall: asyncHandler(async (req: Request, res: Response) => {
    const data = await ServiceCallService.createServiceCallIntoDB(
      req.user,
      req.body,
      req.files,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: 'Service call created successfully!',
      data,
    });
  }),

  // getAllServiceCalls
  getAllServiceCalls: asyncHandler(async (_req: Request, res: Response) => {
    const data = await ServiceCallService.getAllServiceCallsFromDB();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Service calls retrieved successfully!',
      data,
    });
  }),

  // getMyAllServiceCalls
  getMyAllServiceCalls: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id?.toString();
    const data = await ServiceCallService.getMyAllServiceCallsFromDB(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Your service calls retrieved successfully!',
      data,
    });
  }),

  // getSingleServiceCall
  getSingleServiceCall: asyncHandler(async (req: Request, res: Response) => {
    const data = await ServiceCallService.getSingleServiceCallFromDB(
      req.user._id.toString(),
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Service call retrieved successfully!',
      data,
    });
  }),

  // updateServiceCall
  updateServiceCall: asyncHandler(async (req: Request, res: Response) => {
    const data = await ServiceCallService.updateServiceCallIntoDB(
      req.user._id.toString(),
      req.params.id as string,
      req.body as Partial<IServiceCall>,
      req.files,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Service call status updated successfully!',
      data,
    });
  }),

  // deleteServiceCall
  deleteServiceCall: asyncHandler(async (req: Request, res: Response) => {
    const data = await ServiceCallService.deleteServiceCallFromDB(
      req.user._id.toString(),
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Service call deleted successfully!',
      data,
    });
  }),
};
