/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { AppError, asyncHandler } from '../utils';
import { ZodObject } from 'zod';
import httpStatus from 'http-status';

// validateRequest
export const validateRequest = (schema: ZodObject<any, any>) => {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      const parsedData = await schema.parseAsync({
        body: req.body,
        cookies: req.cookies,
        query: req.query,
        params: req.params,
      });

      // Overwrite validated values
      req.body = parsedData.body || req.body;
      req.cookies = parsedData.cookies || req.cookies;
      // req.query = (parsedData.query as any) || req.query;
      // req.params = (parsedData.params as any) || req.params;

      next();
    },
  );
};

// validateRequestFromFormData
export const validateRequestFromFormData = (schema: ZodObject<any, any>) => {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      // Non-file fields arrive as a JSON string in the form-data 'data' field.
      // Default to {} so a file-only request (e.g. replacing just an image) passes.
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

      // Overwrite validated values (files stay on req.files)
      req.body = parsedData?.body ?? req.body;
      req.cookies = parsedData?.cookies ?? req.cookies;

      next();
    },
  );
};
