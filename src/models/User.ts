import { Schema, model, type Document } from "mongoose";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "MODERATOR";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "EDITOR", "MODERATOR"],
      default: "MODERATOR",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default model<IUser>("User", userSchema);
