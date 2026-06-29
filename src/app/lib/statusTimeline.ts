import { Schema } from 'mongoose';

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
