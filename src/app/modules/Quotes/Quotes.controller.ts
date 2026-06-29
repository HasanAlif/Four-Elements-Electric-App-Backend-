import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { QuotesService } from './Quotes.service';

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const getAllMyQuotes = asyncHandler(async (req: Request, res: Response) => {
  const { status, searchQuery } = req.query;

  const data = await QuotesService.getAllMyQuotes(req.user._id.toString(), {
    status: asString(status),
    searchQuery: asString(searchQuery),
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Your quotes retrieved successfully!',
    data,
  });
});

const getMySingleQuoteActivityDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await QuotesService.getMySingleQuoteActivityDetails(
      req.user._id.toString(),
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Quote activity details retrieved successfully!',
      data,
    });
  },
);

const getUserRecntActivity = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await QuotesService.getUserRecntActivity(
      req.user._id.toString(),
      asString(req.query.type),
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Recent activity retrieved successfully!',
      data,
    });
  },
);

const searchQuoteAndPartners = asyncHandler(
  async (req: Request, res: Response) => {
    const { searchQuery } = req.query;

    const data = await QuotesService.searchQuoteAndPartners(
      req.user._id.toString(),
      asString(searchQuery) ?? '',
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Search results retrieved successfully!',
      data,
    });
  },
);

const getAllCategoriesDetails = asyncHandler(
  async (_req: Request, res: Response) => {
    const data = await QuotesService.getAllCategoriesDetails();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Categories retrieved successfully!',
      data,
    });
  },
);

const getAllPartnerDetailsInSingleCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await QuotesService.getAllPartnerDetailsInSingleCategory(
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Partners retrieved successfully!',
      data,
    });
  },
);

const togglePartnerFavorite = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await QuotesService.togglePartnerFavorite(
      req.user._id.toString(),
      req.params.partnerId as string,
      asString(req.query.isFavourite),
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: data.favorited
        ? 'Partner added to favorites!'
        : 'Partner removed from favorites!',
      data,
    });
  },
);

const getAllMyFavoritePartners = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await QuotesService.getAllMyFavoritePartners(
      req.user._id.toString(),
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Favorite partners retrieved successfully!',
      data,
    });
  },
);

const getMySingleFavoritePartnerDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await QuotesService.getMySingleFavoritePartnerDetails(
      req.user._id.toString(),
      req.params.partnerId as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Favorite partner retrieved successfully!',
      data,
    });
  },
);

export const QuotesController = {
  getAllMyQuotes,
  getMySingleQuoteActivityDetails,
  getUserRecntActivity,
  searchQuoteAndPartners,
  getAllCategoriesDetails,
  getAllPartnerDetailsInSingleCategory,
  togglePartnerFavorite,
  getAllMyFavoritePartners,
  getMySingleFavoritePartnerDetails,
};
