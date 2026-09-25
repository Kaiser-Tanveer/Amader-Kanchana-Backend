import { Schema, model, type Document } from "mongoose";

export interface ISiteSetting extends Document {
  orgName: string;
  tagline: string;
  description?: string;
  vision?: string;
  mission?: string;
  facebookUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  socialLinks: { platform: string; url: string }[];
}

const siteSettingSchema = new Schema<ISiteSetting>(
  {
    orgName: { type: String, default: "আমাদের কাঞ্চনা" },
    tagline: { type: String, default: "আমাদের গ্রাম, আমাদেরই দায়িত্ব।" },
    description: { type: String },
    vision: { type: String },
    mission: { type: String },
    facebookUrl: { type: String, default: "https://facebook.com/amader.kanchana" },
    email: { type: String, default: "amaderkanchana@gmail.com" },
    // Not provided in the source profile yet — left blank until real data is entered.
    phone: { type: String, default: "" },
    address: { type: String, default: "কাঞ্চনা, সাতকানিয়া, চট্টগ্রাম" },
    logoUrl: { type: String },
    heroImageUrl: { type: String },
    socialLinks: {
      type: [{ platform: String, url: String }],
      default: [],
    },
  },
  { timestamps: true },
);

export default model<ISiteSetting>("SiteSetting", siteSettingSchema);
