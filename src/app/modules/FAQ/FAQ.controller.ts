import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { FAQService } from './FAQ.service';
import { ContentType } from './appContent.model';

const createFAQ = asyncHandler(async (req: Request, res: Response) => {
  const data = await FAQService.createFAQ(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    message: 'FAQ created successfully!',
    data,
  });
});

const getAllFAQs = asyncHandler(async (req: Request, res: Response) => {
  const data = await FAQService.getAllFAQs();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'FAQs retrieved successfully!',
    data,
  });
});

const getSingleFAQ = asyncHandler(async (req: Request, res: Response) => {
  const data = await FAQService.getSingleFAQ(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'FAQ retrieved successfully!',
    data,
  });
});

const updateFAQ = asyncHandler(async (req: Request, res: Response) => {
  const data = await FAQService.updateFAQ(req.params.id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'FAQ updated successfully!',
    data,
  });
});

const deleteFAQ = asyncHandler(async (req: Request, res: Response) => {
  const data = await FAQService.deleteFAQ(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'FAQ deleted successfully!',
    data,
  });
});

const getContentTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    [ContentType.ABOUT_US]: 'About Us',
    [ContentType.TERMS_AND_CONDITIONS]: 'Terms and Conditions',
  };
  return typeNames[type] || type;
};

const createOrUpdateContent = asyncHandler(
  async (req: Request, res: Response) => {
    const type = req.params.type as ContentType;
    const { content } = req.body;
    const result = await FAQService.createOrUpdateContent(type, content);

    const contentTypeName = getContentTypeName(type);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: `${contentTypeName} updated successfully`,
      data: result,
    });
  },
);

const getContentByType = asyncHandler(async (req: Request, res: Response) => {
  const type = req.params.type as ContentType;
  const result = await FAQService.getContentByType(type);

  const contentTypeName = getContentTypeName(type);
  const message = result._id
    ? `${contentTypeName} retrieved successfully`
    : `${contentTypeName} not yet created`;

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message,
    data: result,
  });
});

export const FAQController = {
  createFAQ,
  getAllFAQs,
  getSingleFAQ,
  updateFAQ,
  deleteFAQ,
  createOrUpdateContent,
  getContentByType,
};
