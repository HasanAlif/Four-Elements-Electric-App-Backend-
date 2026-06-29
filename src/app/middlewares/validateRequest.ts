import { NextFunction, Request, Response } from 'express';
import { AppError, asyncHandler } from '../utils';
import { ZodObject } from 'zod';
import httpStatus from 'http-status';

export const validateRequest = (schema: ZodObject<any, any>) => {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      const parsedData = await schema.parseAsync({
        body: req.body,
        cookies: req.cookies,
        query: req.query,
        params: req.params,
      });

      req.body = parsedData.body || req.body;
      req.cookies = parsedData.cookies || req.cookies;

      next();
    },
  );
};

export const validateRequestFromFormData = (schema: ZodObject<any, any>) => {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      let parsedBody: unknown = {};
      if (req?.body?.data) {
        try {
          parsedBody = JSON.parse(req.body.data);
        } catch {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            "Invalid JSON in 'data' field!",
          );
        }
      }

      const parsedData = await schema.parseAsync({
        body: parsedBody,
        cookies: req.cookies,
        query: req.query,
        params: req.params,
      });

      req.body = parsedData?.body ?? req.body;
      req.cookies = parsedData?.cookies ?? req.cookies;

      next();
    },
  );
};
