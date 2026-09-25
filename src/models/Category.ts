import { Schema, model, type Document } from "mongoose";

export interface ICategory extends Document {
  key: string;
  group: "issue" | "institution" | "project" | "activity";
  labelBn: string;
  labelEn: string;
  color?: string;
  isActive: boolean;
}

const categorySchema = new Schema<ICategory>(
  {
    key: { type: String, required: true },
    group: { type: String, enum: ["issue", "institution", "project", "activity"], required: true },
    labelBn: { type: String, required: true },
    labelEn: { type: String, required: true },
    color: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

categorySchema.index({ key: 1, group: 1 }, { unique: true });

export default model<ICategory>("Category", categorySchema);
