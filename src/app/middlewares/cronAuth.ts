import crypto from 'crypto';
import httpStatus from 'http-status';
import { AppError, asyncHandler } from '../utils';
import config from '../config';

const cronAuth = asyncHandler(async (req, res, next) => {
  const secret = config.maintenance.cron_secret;

  if (!secret) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Maintenance cron secret is not configured!',
    );
  }

  const provided =
    (req.headers['x-cron-secret'] as string | undefined) ||
    req.headers.authorization?.replace('Bearer ', '') ||
    '';

  const providedBuf = Buffer.from(provided);
  const secretBuf = Buffer.from(secret);
  if (
    providedBuf.length !== secretBuf.length ||
    !crypto.timingSafeEqual(providedBuf, secretBuf)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  next();
});

export default cronAuth;
