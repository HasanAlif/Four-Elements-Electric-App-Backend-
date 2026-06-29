import { Schema } from 'mongoose';
import { Service_STATUSES } from '../../constants';
import { NotificationService } from './Notification.service';
import { RecentActivityService } from '../RecentActivity/RecentActivity.service';

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
  });
};
