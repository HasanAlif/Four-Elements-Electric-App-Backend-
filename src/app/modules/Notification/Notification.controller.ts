import httpStatus from 'http-status';
import { Request, Response } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { NotificationService } from './Notification.service';

const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { data, meta } = await NotificationService.getMyNotificationsFromDB(
    req.user._id.toString(),
    req.query as { isRead?: 'true' | 'false' },
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Notifications retrieved successfully!',
    meta,
    data,
  });
});

const markOneAsRead = asyncHandler(async (req: Request, res: Response) => {
  const data = await NotificationService.markOneAsReadIntoDB(
    req.user._id.toString(),
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Notification marked as read!',
    data,
  });
});

const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const data = await NotificationService.markAllAsReadIntoDB(
    req.user._id.toString(),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'All notifications marked as read!',
    data,
  });
});

export const NotificationController = {
  getMyNotifications,
  markOneAsRead,
  markAllAsRead,
};
