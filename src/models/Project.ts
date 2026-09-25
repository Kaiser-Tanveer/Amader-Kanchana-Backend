import { Schema, model, type Document } from "mongoose";

export type ProjectStatus = "PLANNED" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface IProject extends Document {
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  location?: { latitude: number; longitude: number };
  ward?: string;
  target?: string;
  beneficiaries?: number;
  volunteers?: number;
  photos: string[];
  outcomes?: string;
  partners: string[];
  isDemoData: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, enum: ["PLANNED", "ONGOING", "COMPLETED", "CANCELLED"], default: "PLANNED" },
    startDate: Date,
    endDate: Date,
    location: {
      latitude: Number,
      longitude: Number,
    },
    ward: { type: String },
    target: { type: String, trim: true },
    beneficiaries: Number,
    volunteers: Number,
    photos: { type: [String], default: [] },
    outcomes: { type: String, trim: true },
    partners: { type: [String], default: [] },
    isDemoData: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default model<IProject>("Project", projectSchema);
