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
  },
  {
    timestamps: true, // createdAt is needed for the UI "2h ago" labels
    versionKey: false,
  },
);

// Serves the owner list (newest first) and the unread badge in one index.
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const NotificationModel = model<INotification>(
  'Notification',
  notificationSchema,
);

export default NotificationModel;
