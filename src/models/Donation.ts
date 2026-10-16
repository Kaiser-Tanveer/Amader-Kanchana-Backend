import { Schema, model, type Document, type Types } from "mongoose";

export type DonationType = "ONE_TIME" | "MONTHLY";
export type DonationStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
export type DonationPurpose = "GENERAL" | "MEMBERSHIP_DUE" | "CAMPAIGN";
export type PaymentChannel = "GATEWAY" | "MANUAL";
export type ManualMethod = "BKASH" | "NAGAD" | "ROCKET" | "BANK";

export interface IDonation extends Document {
  tranId: string;
  amount: number;
  currency: string;
  type: DonationType;
  purpose: DonationPurpose;
  status: DonationStatus;
  donorName: string;
  donorEmail?: string;
  donorPhone: string;
  isAnonymous: boolean;
  // GATEWAY = paid through SSLCommerz; MANUAL = donor sent money directly to the
  // organization's account and submitted a TrxID for an admin to verify.
  paymentChannel: PaymentChannel;
  paymentMethod?: string;
  gatewayValId?: string;
  gatewayBankTranId?: string;
  rawGatewayResponse?: Record<string, unknown>;
  manualMethod?: ManualMethod;
  manualTrxId?: string;
  senderNumber?: string;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  campaign?: Types.ObjectId;
  member?: Types.ObjectId;
  dueMonth?: string; // "YYYY-MM"
  createdAt: Date;
  updatedAt: Date;
}

const donationSchema = new Schema<IDonation>(
  {
    tranId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 10 },
    currency: { type: String, default: "BDT" },
    type: { type: String, enum: ["ONE_TIME", "MONTHLY"], default: "ONE_TIME" },
    purpose: { type: String, enum: ["GENERAL", "MEMBERSHIP_DUE", "CAMPAIGN"], default: "GENERAL" },
    status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"], default: "PENDING" },
    donorName: { type: String, required: true, trim: true },
    donorEmail: { type: String, trim: true },
    donorPhone: { type: String, required: true, trim: true },
    isAnonymous: { type: Boolean, default: false },
    paymentChannel: { type: String, enum: ["GATEWAY", "MANUAL"], default: "GATEWAY" },
    paymentMethod: { type: String },
    gatewayValId: { type: String },
    gatewayBankTranId: { type: String },
    rawGatewayResponse: { type: Schema.Types.Mixed },
    manualMethod: { type: String, enum: ["BKASH", "NAGAD", "ROCKET", "BANK"] },
    // Unique + sparse: the same TrxID can never be submitted twice, but
    // gateway donations (which have no TrxID) don't collide with each other.
    manualTrxId: { type: String, unique: true, sparse: true },
    senderNumber: { type: String, trim: true },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    campaign: { type: Schema.Types.ObjectId, ref: "Campaign" },
    member: { type: Schema.Types.ObjectId, ref: "Member" },
    dueMonth: { type: String },
  },
  { timestamps: true },
);

export default model<IDonation>("Donation", donationSchema);
