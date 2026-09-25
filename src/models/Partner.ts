import { Schema, model, type Document } from "mongoose";

export interface IPartner extends Document {
  orgName: string;
  category: string;
  contact: string;
  message?: string;
  status: "NEW" | "CONTACTED" | "ACTIVE" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
}

const partnerSchema = new Schema<IPartner>(
  {
    orgName: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    contact: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    status: { type: String, enum: ["NEW", "CONTACTED", "ACTIVE", "CLOSED"], default: "NEW" },
  },
  { timestamps: true },
);

export default model<IPartner>("Partner", partnerSchema);
