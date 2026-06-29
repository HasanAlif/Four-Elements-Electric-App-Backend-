import { NextFunction, Request, Response } from 'express';

const isForbiddenKey = (key: string): boolean =>
  key.startsWith('$') || key.includes('.');

const scrub = (value: unknown): void => {
  if (!value || typeof value !== 'object') return;

  if (Array.isArray(value)) {
    value.forEach(scrub);
    return;
  }

  for (const key of Object.keys(value as Record<string, unknown>)) {
    if (isForbiddenKey(key)) {
      delete (value as Record<string, unknown>)[key];
    } else {
      scrub((value as Record<string, unknown>)[key]);
    }
  }
};

export const sanitizeMongo = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  scrub(req.body);
  scrub(req.params);
  try {
    scrub(req.query);
  } catch {}
  next();
};
