import { Schema, model, type Document } from "mongoose";

export interface ICampaign extends Document {
  title: string;
  description: string;
  goalAmount?: number;
  coverImage?: string;
  isEmergency: boolean; // true = shown as an urgent homepage banner (e.g. flood relief)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    goalAmount: { type: Number },
    coverImage: { type: String },
    isEmergency: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default model<ICampaign>("Campaign", campaignSchema);
