import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { QuotesService } from './Quotes.service';

// Accept a query-string filter only if it is actually a string (drops objects/arrays
// like ?status[$ne]=x so they can never reach a Mongo filter or crash string ops).
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

export const QuotesController = {
  getAllMyQuotes,
  getMySingleQuoteActivityDetails,
};
