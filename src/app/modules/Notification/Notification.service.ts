/* eslint-disable no-console */
import httpStatus from 'http-status';
import { isValidObjectId, Types } from 'mongoose';
import { AppError } from '../../utils';
import { sendPushToTokens } from '../../lib';
import QueryBuilder from '../../builder/QueryBuilder';
import UserModel from '../User/user.model';
import NotificationModel from './Notification.model';
import { INotification, TNotificationType } from './Notification.interface';
import { buildNotificationContent } from './Notification.constant';

// ----- Internal creation/dispatch choke point -----

type TNotifyInput = {
  recipientId: Types.ObjectId | string;
  serviceModel: string;
  serviceId: Types.ObjectId | string;
  qId?: string;
  serviceType?: string;
  status?: string;
};

// Load the recipient's device tokens and deliver the push. Prunes dead tokens.
// Never throws here — callers wrap, but keep this resilient regardless.
const dispatchPush = async (notification: INotification): Promise<void> => {
  const recipient = await UserModel.findById(notification.user).select(
    'fcmTokens',
  );
  const tokens = recipient?.fcmTokens ?? [];
  if (tokens.length === 0) return;

  // FCM data values MUST all be strings (for deep-linking on the device).
  const data: Record<string, string> = {
    type: notification.type,
    serviceModel: notification.serviceModel ?? '',
    serviceId: notification.serviceId ? String(notification.serviceId) : '',
    qId: notification.qId ?? '',
    status: notification.status ?? '',
    fieldKey: notification.fieldKey ?? '',
  };

  const result = await sendPushToTokens(
    tokens,
    { title: notification.title, body: notification.message },
    data,
  );

  if (result.invalidTokens.length > 0) {
    await UserModel.updateOne(
      { _id: notification.user },
      { $pull: { fcmTokens: { $in: result.invalidTokens } } },
    );
  }

  console.log(
    `[notification] push to user ${String(notification.user)}: success=${result.successCount} failure=${result.failureCount}`,
  );
};

// The shared persist→dispatch choke point. Persist FIRST, then push. Fully isolated —
// never throws — so a notification/FCM failure can never break the action that
// triggered it (a quote write, an admin update, or a maintenance scan).
type TPersistInput = {
  user: Types.ObjectId | string;
  type: TNotificationType;
  title: string;
  message: string;
  serviceModel?: string;
  serviceId?: Types.ObjectId | string;
  qId?: string;
  serviceType?: string;
  status?: string;
  fieldKey?: string;
};

const persistAndDispatch = async (doc: TPersistInput): Promise<void> => {
  try {
    const notification = await NotificationModel.create(doc);
    await dispatchPush(notification);
  } catch (err) {
    console.error(`[notification] ${doc.type} dispatch failed:`, err);
  }
};

// Quote notifications: copy is derived from the centralized catalog.
const createAndDispatch = (
  type: TNotificationType,
  event: string,
  input: TNotifyInput,
): Promise<void> => {
  const { title, message } = buildNotificationContent(event, {
    serviceType: input.serviceType,
    qId: input.qId,
  });

  return persistAndDispatch({
    user: input.recipientId,
    type,
    title,
    message,
    serviceModel: input.serviceModel,
    serviceId: input.serviceId,
    qId: input.qId,
    serviceType: input.serviceType,
    status: input.status,
  });
};

// Fired when a quote is first submitted (qId minted). Idempotent at the trigger.
const notifyQuoteSubmitted = (input: TNotifyInput): Promise<void> =>
  createAndDispatch('QUOTE_SUBMITTED', 'submitted', input);

// Fired when an admin changes a quote's status (the new status drives the copy).
const notifyStatusChanged = (
  input: TNotifyInput & { status: string },
): Promise<void> => createAndDispatch('STATUS_CHANGED', input.status, input);

// Fired by the daily maintenance cron when a tracked task is due. Title/message come
// from the maintenance config map (passed in), keeping this module decoupled from it.
const notifyMaintenanceReminder = (input: {
  recipientId: Types.ObjectId | string;
  fieldKey: string;
  title: string;
  message: string;
}): Promise<void> =>
  persistAndDispatch({
    user: input.recipientId,
    type: 'MAINTENANCE_REMINDER',
    title: input.title,
    message: input.message,
    fieldKey: input.fieldKey,
  });

// ----- Owner-scoped read / state -----

type TGetMyNotificationsQuery = {
  page?: string;
  limit?: string;
  sort?: string;
  fields?: string;
  isRead?: 'true' | 'false';
};

const getMyNotificationsFromDB = async (
  userId: string,
  query: TGetMyNotificationsQuery = {},
) => {
  const baseFilter: Record<string, unknown> = { user: userId };
  if (query.isRead === 'true') baseFilter.isRead = true;
  else if (query.isRead === 'false') baseFilter.isRead = false;

  const notificationQuery = new QueryBuilder<INotification>(
    NotificationModel.find(baseFilter),
    query as Record<string, unknown>,
  )
    .sort()
    .paginate()
    .fields();

  const [data, meta, unreadCount] = await Promise.all([
    notificationQuery.modelQuery.lean(),
    notificationQuery.countTotal(),
    NotificationModel.countDocuments({ user: userId, isRead: false }),
  ]);

  return { data, meta: { ...meta, unreadCount } };
};

const markOneAsReadIntoDB = async (userId: string, id: string) => {
  if (!isValidObjectId(id)) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found!');
  }

  const notification = await NotificationModel.findOneAndUpdate(
    { _id: id, user: userId },
    { isRead: true },
    { new: true },
  );

  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found!');
  }

  return notification;
};

const markAllAsReadIntoDB = async (userId: string) => {
  const result = await NotificationModel.updateMany(
    { user: userId, isRead: false },
    { isRead: true },
  );

  return { modifiedCount: result.modifiedCount };
};

export const NotificationService = {
  notifyQuoteSubmitted,
  notifyStatusChanged,
  notifyMaintenanceReminder,
  getMyNotificationsFromDB,
  markOneAsReadIntoDB,
  markAllAsReadIntoDB,
};
