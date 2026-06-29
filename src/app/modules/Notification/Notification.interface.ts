import { Document, Types } from 'mongoose';

export const NOTIFICATION_TYPES = [
  'QUOTE_SUBMITTED',
  'STATUS_CHANGED',
  'MAINTENANCE_REMINDER',
] as const;
export type TNotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification extends Document {
  _id: Types.ObjectId;

  user: Types.ObjectId;
  type: TNotificationType;
  title: string;
  message: string;
  isRead: boolean;

  serviceModel?: string;
  serviceId?: Types.ObjectId;
  qId?: string;
  serviceType?: string;
  status?: string;
  fieldKey?: string;

  createdAt: Date;
  updatedAt: Date;
}
