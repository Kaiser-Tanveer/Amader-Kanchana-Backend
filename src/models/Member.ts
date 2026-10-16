import { Schema, model, type Document } from "mongoose";

export interface IMember extends Document {
  name: string;
  phone: string;
  email?: string;
  ward?: string;
  monthlyDueAmount: number;
  isActive: boolean;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, unique: true },
    email: { type: String, trim: true },
    ward: { type: String },
    // The agreed monthly due for this member — set per member since dues may
    // differ (e.g. student vs. professional member).
    monthlyDueAmount: { type: Number, required: true, default: 100 },
    isActive: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default model<IMember>("Member", memberSchema);
