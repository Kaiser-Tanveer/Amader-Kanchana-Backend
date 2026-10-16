import crypto from "crypto";
import mongoose from "mongoose";
import type { Types } from "mongoose";
import type { Response } from "express";
import Donation, { type DonationPurpose, type ManualMethod } from "@/models/Donation";
import Campaign from "@/models/Campaign";
import Member, { type IMember } from "@/models/Member";
import { env } from "@/config/env";
import { ok, created, fail } from "@/utils/apiResponse";
import { asyncHandler } from "@/middleware/errorHandler";
import type { AuthenticatedRequest } from "@/middleware/auth";
import { initiateSSLCommerzPayment, validateSSLCommerzTransaction } from "@/services/sslcommerz";

interface ResolvedPurpose {
  purpose: DonationPurpose;
  campaign?: Types.ObjectId;
  member?: IMember;
  dueMonth?: string;
  error?: string;
}

// Never trust the client for what a payment is "for": campaigns and members
// are looked up on the server, and the due month is computed here too.
const resolvePurpose = async (
  purpose: unknown,
  campaignId: unknown,
  memberId: unknown,
): Promise<ResolvedPurpose> => {
  if (purpose === "CAMPAIGN") {
    if (typeof campaignId !== "string" || !mongoose.isValidObjectId(campaignId)) {
      return { purpose: "GENERAL", error: "This campaign is not available." };
    }
    const campaign = await Campaign.findOne({ _id: campaignId, isActive: true });
    if (!campaign) return { purpose: "GENERAL", error: "This campaign is not available." };
    return { purpose: "CAMPAIGN", campaign: campaign._id as Types.ObjectId };
  }

  if (purpose === "MEMBERSHIP_DUE") {
    if (typeof memberId !== "string" || !mongoose.isValidObjectId(memberId)) {
      return { purpose: "GENERAL", error: "Member not found." };
    }
    const member = await Member.findOne({ _id: memberId, isActive: true });
    if (!member) return { purpose: "GENERAL", error: "Member not found." };
    return { purpose: "MEMBERSHIP_DUE", member, dueMonth: new Date().toISOString().slice(0, 7) };
  }

  return { purpose: "GENERAL" };
};

// ---------- Gateway (SSLCommerz) flow ----------

export const initiateDonation = asyncHandler(async (req, res) => {
  const { amount, type, donorName, donorEmail, donorPhone, isAnonymous, purpose, campaignId, memberId } =
    req.body;

  const resolved = await resolvePurpose(purpose, campaignId, memberId);
  if (resolved.error) return fail(res, 400, resolved.error);

  // A member's monthly due is fixed by the organization — ignore any amount the browser sent.
  const finalAmount = resolved.member ? resolved.member.monthlyDueAmount : Number(amount);
  const finalName = resolved.member?.name ?? donorName;
  const finalPhone = resolved.member?.phone ?? donorPhone;

  if (!finalAmount || finalAmount < 10) {
    return fail(res, 400, "Please enter a valid donation amount (minimum ৳10).");
  }
  if (!finalName || !donorEmail || !finalPhone) {
    return fail(res, 400, "Name, email and phone are required.");
  }

  const tranId = `AK-DON-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

  const donation = await Donation.create({
    tranId,
    amount: finalAmount,
    type: resolved.member || type === "MONTHLY" ? "MONTHLY" : "ONE_TIME",
    purpose: resolved.purpose,
    donorName: finalName,
    donorEmail,
    donorPhone: finalPhone,
    isAnonymous: Boolean(isAnonymous),
    paymentChannel: "GATEWAY",
    status: "PENDING",
    campaign: resolved.campaign,
    member: resolved.member?._id,
    dueMonth: resolved.dueMonth,
  });

  try {
    const gatewayUrl = await initiateSSLCommerzPayment({
      tranId,
      amount: donation.amount,
      donorName: finalName,
      donorEmail,
      donorPhone: finalPhone,
    });
    return created(res, { gatewayUrl, tranId });
  } catch (err) {
    donation.status = "FAILED";
    await donation.save();
    throw err;
  }
});

export const handleIpn = asyncHandler(async (req, res) => {
  const { tran_id: tranId, val_id: valId, status } = req.body as Record<string, string>;

  const donation = await Donation.findOne({ tranId });
  if (!donation) return fail(res, 404, "Unknown transaction.");

  if (status === "VALID" || status === "VALIDATED") {
    const verification = await validateSSLCommerzTransaction(valId);
    const verified = verification as { status?: string; card_type?: string; bank_tran_id?: string };

    if (verified.status === "VALID" || verified.status === "VALIDATED") {
      donation.status = "SUCCESS";
      donation.paymentMethod = verified.card_type;
      donation.gatewayValId = valId;
      donation.gatewayBankTranId = verified.bank_tran_id;
      donation.rawGatewayResponse = verified;
    } else {
      donation.status = "FAILED";
    }
  } else if (status === "FAILED") {
    donation.status = "FAILED";
  } else if (status === "CANCELLED") {
    donation.status = "CANCELLED";
  }

  await donation.save();
  return ok(res, { received: true });
});

export const getDonationStatus = asyncHandler(async (req, res) => {
  const donation = await Donation.findOne({ tranId: req.params.tranId }).lean();
  if (!donation) return fail(res, 404, "Donation not found.");
  return ok(res, { status: donation.status, amount: donation.amount, type: donation.type });
});

// ---------- Manual (free) flow: donor sends money directly, admin verifies ----------

const MANUAL_METHODS: ManualMethod[] = ["BKASH", "NAGAD", "ROCKET", "BANK"];

// Public: where donors should send money. Read from environment variables so
// numbers can change without a code change. Also tells the frontend whether
// the SSLCommerz gateway is configured yet.
export const getManualPaymentInfo = asyncHandler(async (_req, res) => {
  const accounts = [
    { method: "BKASH", label: "bKash", number: process.env.MANUAL_BKASH_NUMBER },
    { method: "NAGAD", label: "Nagad", number: process.env.MANUAL_NAGAD_NUMBER },
    { method: "ROCKET", label: "Rocket", number: process.env.MANUAL_ROCKET_NUMBER },
  ].filter((a): a is { method: string; label: string; number: string } => Boolean(a.number));

  return ok(res, {
    accountName: process.env.MANUAL_ACCOUNT_NAME ?? "",
    accounts,
    bankDetails: process.env.MANUAL_BANK_DETAILS ?? "",
    gatewayEnabled: Boolean(env.sslcommerz.storeId && env.sslcommerz.storePassword),
  });
});

export const submitManualDonation = asyncHandler(async (req, res) => {
  const {
    amount,
    method,
    trxId,
    senderNumber,
    donorName,
    donorEmail,
    donorPhone,
    isAnonymous,
    purpose,
    campaignId,
    memberId,
  } = req.body;

  const resolved = await resolvePurpose(purpose, campaignId, memberId);
  if (resolved.error) return fail(res, 400, resolved.error);

  const finalName = resolved.member?.name ?? donorName;
  const finalPhone = resolved.member?.phone ?? donorPhone;

  if (!finalName || !finalPhone) return fail(res, 400, "Name and phone are required.");
  if (!Number(amount) || Number(amount) < 10) {
    return fail(res, 400, "Please enter the amount you sent (minimum ৳10).");
  }
  if (!MANUAL_METHODS.includes(method)) return fail(res, 400, "Please choose how you sent the money.");

  const normalizedTrxId = String(trxId ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9\-_/]{5,39}$/.test(normalizedTrxId)) {
    return fail(res, 400, "Please enter a valid Transaction ID / reference (letters and numbers only).");
  }

  if (await Donation.exists({ manualTrxId: normalizedTrxId })) {
    return fail(res, 409, "This Transaction ID has already been submitted.");
  }

  const tranId = `AK-MAN-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

  await Donation.create({
    tranId,
    amount: Number(amount),
    type: resolved.member ? "MONTHLY" : "ONE_TIME",
    purpose: resolved.purpose,
    donorName: finalName,
    donorEmail: donorEmail || undefined,
    donorPhone: finalPhone,
    isAnonymous: Boolean(isAnonymous),
    paymentChannel: "MANUAL",
    manualMethod: method,
    manualTrxId: normalizedTrxId,
    senderNumber: senderNumber || undefined,
    status: "PENDING",
    campaign: resolved.campaign,
    member: resolved.member?._id,
    dueMonth: resolved.dueMonth,
  });

  return created(res, { reference: tranId });
});

// Admin: approve or reject a manual donation after checking the account statement.
export const verifyManualDonation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body as { status?: string };
  if (status !== "SUCCESS" && status !== "FAILED") {
    return fail(res, 400, "Status must be SUCCESS or FAILED.");
  }

  const donation = await Donation.findById(req.params.id);
  if (!donation || donation.paymentChannel !== "MANUAL") {
    return fail(res, 404, "Manual donation not found.");
  }
  if (donation.status !== "PENDING") {
    return fail(res, 409, "This donation has already been reviewed.");
  }

  donation.status = status;
  donation.verifiedAt = new Date();
  if (req.user?.userId) donation.verifiedBy = req.user.userId as never;
  await donation.save();

  return ok(res, donation);
});

// ---------- Admin + public listing ----------

export const listDonationsForAdmin = asyncHandler(async (_req, res) => {
  const donations = await Donation.find()
    .select("-rawGatewayResponse")
    .sort({ createdAt: -1 })
    .populate("campaign", "title")
    .lean();
  return ok(res, donations);
});

// Public: aggregate totals only, no donor personal data.
export const getPublicDonationStats = asyncHandler(async (_req, res) => {
  const [totals] = await Donation.aggregate([
    { $match: { status: "SUCCESS" } },
    { $group: { _id: null, totalAmount: { $sum: "$amount" }, totalDonations: { $sum: 1 } } },
  ]);

  return ok(res, {
    totalAmount: totals?.totalAmount ?? 0,
    totalDonations: totals?.totalDonations ?? 0,
  });
});
