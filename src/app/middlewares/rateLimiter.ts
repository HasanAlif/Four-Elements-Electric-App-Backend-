import { rateLimit } from 'express-rate-limit';
import httpStatus from 'http-status';
import { AppError } from '../utils';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // per IP per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(
      new AppError(
        httpStatus.TOO_MANY_REQUESTS,
        'Too many requests, please try again later!',
      ),
    ),
});

// Stricter limiter for auth / OTP endpoints (credential + OTP brute-force).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // per IP per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) =>
    next(
      new AppError(
        httpStatus.TOO_MANY_REQUESTS,
        'Too many attempts, please try again later!',
      ),
    ),
});
