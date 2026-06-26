import { Document, Types } from 'mongoose';

// A notification is created internally on two events: a quote being submitted, and an
// admin changing a quote's status. There is no public create endpoint.
export const NOTIFICATION_TYPES = ['QUOTE_SUBMITTED', 'STATUS_CHANGED'] as const;
export type TNotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification extends Document {
  _id: Types.ObjectId;

  user: Types.ObjectId; // recipient (the quote owner / createdBy)
  type: TNotificationType;
  title: string;
  message: string;
  isRead: boolean;

  // Deep-link context so the app can open the exact quote.
  serviceModel: string; // mongoose model name, e.g. 'CellingFans'
  serviceId: Types.ObjectId; // the service-request document id
  qId?: string;
  serviceType?: string;
  status?: string;

  createdAt: Date;
  updatedAt: Date;
}
