/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema } from 'mongoose';
import { Service_STATUSES } from '../../constants';
import { NotificationService } from './Notification.service';

// Emits a QUOTE_SUBMITTED notification the first time a service request becomes a
// real (non-draft) quote — i.e. the exact moment qIdPlugin mints its qId. Defined
// once and applied to every service schema.
//
// IMPORTANT: register this plugin BEFORE qIdPlugin on each schema. The pre('save')
// here must run while `qId` is still absent (so it can detect the first submission);
// qIdPlugin then mints `qId` in its own pre('save'), and our post('save') reads it.
//
// Exactly-once: the `!this.qId` guard mirrors qIdPlugin's mint condition, so this
// never fires on draft saves and never re-fires on later edits (qId is already set).
export const quoteSubmitNotificationPlugin = (schema: Schema) => {
  schema.pre('save', function (this: any) {
    this.$locals.__isFirstSubmission =
      !this.qId && !!this.status && this.status !== Service_STATUSES.DRAFT;
  });

  schema.post('save', async function (this: any) {
    if (!this.$locals.__isFirstSubmission) return;

    // Awaited but fully isolated inside the service — it never throws, so the
    // quote's save() always succeeds even if persistence or the push fails.
    await NotificationService.notifyQuoteSubmitted({
      recipientId: this.createdBy,
      serviceModel: this.constructor.modelName,
      serviceId: this._id,
      qId: this.qId,
      serviceType: this.serviceType,
      status: this.status,
    });
  });
};
