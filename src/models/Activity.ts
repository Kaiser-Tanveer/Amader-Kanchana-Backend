import { Schema, model, type Document, type Types } from "mongoose";

export interface IActivity extends Document {
  title: string;
  date: Date;
  location?: string;
  description: string;
  category: string;
  photos: string[];
  relatedProject?: Types.ObjectId;
  isPublished: boolean;
  isDemoData: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    photos: { type: [String], default: [] },
    relatedProject: { type: Schema.Types.ObjectId, ref: "Project" },
    isPublished: { type: Boolean, default: true },
    isDemoData: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default model<IActivity>("Activity", activitySchema);
