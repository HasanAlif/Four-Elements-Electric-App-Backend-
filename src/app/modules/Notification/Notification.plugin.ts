import { Schema } from 'mongoose';
import { Service_STATUSES } from '../../constants';
import { NotificationService } from './Notification.service';
import { RecentActivityService } from '../RecentActivity/RecentActivity.service';
import { dispatchQuoteAdminAlertEmail } from '../../utils/quoteAdminAlertEmail';

export const quoteSubmitNotificationPlugin = (schema: Schema) => {
  schema.pre('save', function (this: any) {
    this.$locals.__isFirstSubmission =
      !this.qId && !!this.status && this.status !== Service_STATUSES.DRAFT;
  });

  schema.post('save', async function (this: any) {
    if (!this.$locals.__isFirstSubmission) return;

    await NotificationService.notifyQuoteSubmitted({
      recipientId: this.createdBy,
      serviceModel: this.constructor.modelName,
      serviceId: this._id,
      qId: this.qId,
      serviceType: this.serviceType,
      status: this.status,
    });

    await RecentActivityService.recordQuoteActivity({
      user: this.createdBy,
      refId: this._id,
      refModel: this.constructor.modelName,
      title: this.serviceType,
      status: this.status,
      createdAt: this.createdAt,
    });

    // Fire-and-forget: never awaited
    try {
      void dispatchQuoteAdminAlertEmail({
        serviceModel: this.constructor.modelName,
        serviceType: this.serviceType,
        qId: this.qId,
        status: this.status,
        createdBy: this.createdBy,
        doc: this.toObject(),
      }).catch((err: unknown) =>
        console.error('[admin-quote-alert] dispatch failed:', err),
      );
    } catch (err) {
      console.error('[admin-quote-alert] dispatch failed to start:', err);
    }
  });
};
