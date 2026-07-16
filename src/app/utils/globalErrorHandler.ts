import { ErrorRequestHandler } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import { TErrorSources } from '../interface/error';
import config from '../config';
import handleZodError from '../errors/handleZodError';
import handleCastError from '../errors/handleCastError';
import handleDuplicateError from '../errors/handleDuplicateError';
import AppError from './AppError';
import handleValidationError from '../errors/handleValidationError';
// import { errorLogger } from '../middlewares/logger';

// global error handling middleware (four parameters error handler)
const globalErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // settle default values
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong!';
  let meta = {};
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong!',
    },
  ];

  // handle specific error types and simplify their error responses
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.errorSources[0].message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.errorSources[0].message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'CastError') {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err?.name === 'MulterError') {
    statusCode = 400;
    message = err.message;
    errorSources = [
      {
        path: err.field || '',
        message: err.message,
      },
    ];
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    meta = err?.meta || {};
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  } else if (err instanceof Error) {
    const safeMessage = err.message; // Exposing error message for debugging
    message = safeMessage;
    errorSources = [
      {
        path: '',
        message: safeMessage,
      },
    ];
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...meta,
    errorSources,
  });
};

export default globalErrorHandler;
