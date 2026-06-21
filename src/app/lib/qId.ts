import { model, Schema } from 'mongoose';
import { Service_STATUSES } from '../constants';

interface ICounter {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const CounterModel = model<ICounter>('Counter', counterSchema);

const QUOTE_COUNTER_ID = 'quote';

export const getNextQId = async (): Promise<string> => {
  const counter = await CounterModel.findByIdAndUpdate(
    QUOTE_COUNTER_ID,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  if (!counter) {
    throw new Error('Failed to generate Q-Id sequence!');
  }

  return `Q-${counter.seq}`;
};

export const qIdPlugin = (schema: Schema) => {
  schema.add({ qId: { type: String, index: true } });

  schema.pre('save', async function (this: any) {
    if (!this.qId && this.status && this.status !== Service_STATUSES.DRAFT) {
      this.qId = await getNextQId();
    }
  });
};
