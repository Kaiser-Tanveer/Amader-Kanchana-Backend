import { Schema, model, type Document } from "mongoose";

export interface IVolunteer extends Document {
  name: string;
  mobile: string;
  email?: string;
  ward: string;
  profession?: string;
  interests: string[];
  skills?: string;
  availability?: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const volunteerSchema = new Schema<IVolunteer>(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    ward: { type: String, required: true },
    profession: { type: String, trim: true },
    interests: { type: [String], default: [] },
    skills: { type: String, trim: true },
    availability: { type: String, trim: true },
    message: { type: String, trim: true },
  },
  { timestamps: true },
);

export default model<IVolunteer>("Volunteer", volunteerSchema);
