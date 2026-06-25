/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema } from 'mongoose';

// Records every status transition a quote goes through, so the user-facing
// activity view can show a real sequence (pending -> in_review -> send ...).
// Applied to all service-request models alongside qIdPlugin.
//
// - pre('save')  covers creation (Model.create) and user updates incl. the
//   in-place draft -> submit flip (existing.save()).
// - pre('findOneAndUpdate') covers admin status changes (Admin.updateQuoteStatus
//   uses findOneAndUpdate), so the admin service needs no change.
export const statusTimelinePlugin = (schema: Schema) => {
  schema.add({
    statusTimeline: {
      type: [
        {
          _id: false,
          status: { type: String },
          changedAt: { type: Date },
        },
      ],
      default: [],
    },
  });

  schema.pre('save', function (this: any) {
    if (this.isNew) {
      this.statusTimeline = [
        ...(this.statusTimeline ?? []),
        { status: this.status, changedAt: new Date() },
      ];
    } else if (this.isModified('status')) {
      this.statusTimeline = [
        ...(this.statusTimeline ?? []),
        { status: this.status, changedAt: new Date() },
      ];
    }
  });

  schema.pre('findOneAndUpdate', function (this: any) {
    const update = this.getUpdate();
    if (!update) return;

    const nextStatus = update.status ?? update.$set?.status;
    if (!nextStatus) return;

    update.$push = {
      ...(update.$push ?? {}),
      statusTimeline: { status: nextStatus, changedAt: new Date() },
    };
    this.setUpdate(update);
  });
};
