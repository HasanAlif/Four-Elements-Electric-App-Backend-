import httpStatus from 'http-status';
import { AppError, asyncHandler } from '../utils';
import config from '../config';

// Guards the internal cron endpoint: the caller (Vercel Cron / cloud scheduler) must
// present the shared secret via the `x-cron-secret` header OR `Authorization: Bearer
// <secret>` (Vercel Cron uses the latter). Never runs unprotected — a server with no
// configured secret rejects with 500 rather than allowing the scan.
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
    req.headers.authorization?.replace('Bearer ', '');

  if (provided !== secret) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  next();
});

export default cronAuth;
