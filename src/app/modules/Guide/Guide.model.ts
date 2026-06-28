import { Schema, model, Document } from 'mongoose';

export interface IGuide extends Document {
  name: string;
  safetyWarnings: string;
  steps: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GuideSchema = new Schema<IGuide>(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Name is required!'],
    },
    safetyWarnings: {
      type: String,
      trim: true,
      required: [true, 'Safety warnings are required!'],
    },
    steps: {
      type: [String],
      required: [true, 'Steps are required!'],
    },
  },
  { timestamps: true, versionKey: false },
);

const GuideModel = model<IGuide>('Guide', GuideSchema);

export default GuideModel;
