import { Document, Types } from 'mongoose';

// A notification is created internally only (no public create endpoint), on these
// events: a quote being submitted, an admin changing a quote's status, or a due
// home-maintenance reminder.
export const NOTIFICATION_TYPES = [
  'QUOTE_SUBMITTED',
  'STATUS_CHANGED',
  'MAINTENANCE_REMINDER',
] as const;
export type TNotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification extends Document {
  _id: Types.ObjectId;

  user: Types.ObjectId; // recipient (the quote owner / createdBy)
  type: TNotificationType;
  title: string;
  message: string;
  isRead: boolean;

  // Deep-link context. Quote fields are optional so non-quote types (e.g.
  // MAINTENANCE_REMINDER) fit the same model.
  serviceModel?: string; // mongoose model name, e.g. 'CellingFans'
  serviceId?: Types.ObjectId; // the service-request document id
  qId?: string;
  serviceType?: string;
  status?: string;
  fieldKey?: string; // maintenance task key for MAINTENANCE_REMINDER notifications

  createdAt: Date;
  updatedAt: Date;
}
