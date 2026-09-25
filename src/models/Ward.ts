import { Schema, model, type Document } from "mongoose";

export interface IWard extends Document {
  number: number;
  name?: string;
  nameEn?: string;
  description?: string;
  isDemoData: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const wardSchema = new Schema<IWard>(
  {
    number: { type: Number, required: true, unique: true, min: 1, max: 9 },
    // Real ward names are not yet available (see project brief); left optional
    // and editable from the admin panel rather than invented.
    name: { type: String, trim: true },
    nameEn: { type: String, trim: true },
    description: { type: String, trim: true },
    isDemoData: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default model<IWard>("Ward", wardSchema);
