import { Schema, model, type Document } from "mongoose";

export const INSTITUTION_CATEGORIES = [
  "school",
  "college",
  "madrasa",
  "mosque",
  "temple",
  "health",
  "market",
  "playground",
  "community",
  "other",
] as const;

export interface IInstitution extends Document {
  name: string;
  category: string;
  ward: string;
  address?: string;
  location?: { latitude: number; longitude: number };
  contact?: string;
  description?: string;
  image?: string;
  isDemoData: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const institutionSchema = new Schema<IInstitution>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: INSTITUTION_CATEGORIES, required: true },
    ward: { type: String, required: true },
    address: { type: String, trim: true },
    location: {
      latitude: Number,
      longitude: Number,
    },
    contact: { type: String, trim: true },
    description: { type: String, trim: true },
    image: { type: String },
    isDemoData: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default model<IInstitution>("Institution", institutionSchema);
