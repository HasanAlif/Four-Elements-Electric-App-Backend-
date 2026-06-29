import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { AppError, asyncHandler } from '../utils';
import { TRole } from '../modules/User/user.constant';
import UserModel from '../modules/User/user.model';
import { verifyToken } from '../lib';
import config from '../config';

const auth = (...requiredRoles: TRole[]) => {
  return asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    const decoded = verifyToken(token, config.jwt.access_secret!) as JwtPayload;

    const { _id, iat } = decoded;

    const user = await UserModel.findById(_id);

    if (!user) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'User not exists!');
    }

    if (!user.isActive) {
      throw new AppError(httpStatus.BAD_REQUEST, 'You are not authorized!');
    }

    if (user.isDeleted) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    if (!user.isVerifiedByOTP) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    if (user.passwordChangedAt && user.isJWTIssuedBeforePasswordChanged(iat)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
    }

    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'You have no access to this route, Forbidden!',
      );
    }

    req.user = user;
    next();
  });
};

export default auth;
