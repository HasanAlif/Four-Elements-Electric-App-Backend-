import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { GuideService } from './Guide.service';

const createGuide = asyncHandler(async (req: Request, res: Response) => {
  const data = await GuideService.createGuideIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'Guide created successfully!',
    data,
  });
});

const getAllGuides = asyncHandler(async (req: Request, res: Response) => {
  const { data, meta } = await GuideService.getAllGuidesFromDB(
    req.user._id.toString(),
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Guides retrieved successfully!',
    meta,
    data,
  });
});

const getMySavedGuides = asyncHandler(async (req: Request, res: Response) => {
  const { data, meta } = await GuideService.getMySavedGuidesFromDB(
    req.user._id.toString(),
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Saved guides retrieved successfully!',
    meta,
    data,
  });
});

const getSingleGuide = asyncHandler(async (req: Request, res: Response) => {
  const data = await GuideService.getSingleGuideFromDB(
    req.user._id.toString(),
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Guide retrieved successfully!',
    data,
  });
});

const saveGuide = asyncHandler(async (req: Request, res: Response) => {
  const data = await GuideService.saveGuideIntoDB(
    req.user._id.toString(),
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Guide saved successfully!',
    data,
  });
});

const unsaveGuide = asyncHandler(async (req: Request, res: Response) => {
  const data = await GuideService.unsaveGuideFromDB(
    req.user._id.toString(),
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Guide unsaved successfully!',
    data,
  });
});

export const GuideController = {
  createGuide,
  getAllGuides,
  getMySavedGuides,
  getSingleGuide,
  saveGuide,
  unsaveGuide,
};
