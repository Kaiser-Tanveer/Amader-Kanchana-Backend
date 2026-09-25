import { Schema, model, type Document, type Types } from "mongoose";

export type IssueStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "FORWARDED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export const ISSUE_STATUSES: IssueStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "FORWARDED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

export interface IIssueUpdate {
  _id: Types.ObjectId;
  status: IssueStatus;
  note?: string;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
}

export interface IIssue extends Document {
  referenceNumber: string;
  title: string;
  category: string;
  ward: string;
  area: string;
  description: string;
  photos: string[];
  location?: { latitude: number; longitude: number };
  status: IssueStatus;
  isPublic: boolean;
  isDemoData: boolean;
  reporter?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  assignedTo?: Types.ObjectId;
  updates: IIssueUpdate[];
  createdAt: Date;
  updatedAt: Date;
}

const issueUpdateSchema = new Schema<IIssueUpdate>(
  {
    status: { type: String, enum: ISSUE_STATUSES, required: true },
    note: { type: String, trim: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const issueSchema = new Schema<IIssue>(
  {
    referenceNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    ward: { type: String, required: true },
    area: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    photos: { type: [String], default: [] },
    location: {
      latitude: Number,
      longitude: Number,
    },
    status: { type: String, enum: ISSUE_STATUSES, default: "SUBMITTED" },
    isPublic: { type: Boolean, default: true },
    isDemoData: { type: Boolean, default: false },
    // Reporter contact info is private — excluded from public API responses
    // by the controller layer, never returned unless explicitly required.
    reporter: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    updates: { type: [issueUpdateSchema], default: [] },
  },
  { timestamps: true },
);

issueSchema.index({ title: "text", area: "text" });

export default model<IIssue>("Issue", issueSchema);
