import { model, Schema } from 'mongoose';
import { INotification, NOTIFICATION_TYPES } from './Notification.interface';

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },

    // Deep-link context.
    serviceModel: {
      type: String,
      trim: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
    },
    qId: {
      type: String,
      trim: true,
    },
    serviceType: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
    },
    // Maintenance task key for MAINTENANCE_REMINDER notifications.
    fieldKey: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const NotificationModel = model<INotification>(
  'Notification',
  notificationSchema,
);

export default NotificationModel;
