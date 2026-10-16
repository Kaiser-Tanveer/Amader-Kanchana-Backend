import Campaign from "@/models/Campaign";
import Donation from "@/models/Donation";
import { ok, created, fail } from "@/utils/apiResponse";
import { asyncHandler } from "@/middleware/errorHandler";

// Public: all active campaigns, with live raised-amount totals computed from
// successful donations (never a stale cached number).
export const listActiveCampaigns = asyncHandler(async (_req, res) => {
  const campaigns = await Campaign.find({ isActive: true }).sort({ isEmergency: -1, createdAt: -1 }).lean();

  const withTotals = await Promise.all(
    campaigns.map(async (c) => {
      const [agg] = await Donation.aggregate([
        { $match: { campaign: c._id, status: "SUCCESS" } },
        { $group: { _id: null, raised: { $sum: "$amount" } } },
      ]);
      return { ...c, raisedAmount: agg?.raised ?? 0 };
    }),
  );

  return ok(res, withTotals);
});

// Public: the active emergency campaign, if any — what the homepage banner
// checks. Returns null when none, so the banner simply doesn't render.
export const getActiveEmergencyCampaign = asyncHandler(async (_req, res) => {
  const campaign = await Campaign.findOne({ isActive: true, isEmergency: true })
    .sort({ createdAt: -1 })
    .lean();

  if (!campaign) return ok(res, null);

  const [agg] = await Donation.aggregate([
    { $match: { campaign: campaign._id, status: "SUCCESS" } },
    { $group: { _id: null, raised: { $sum: "$amount" } } },
  ]);

  return ok(res, { ...campaign, raisedAmount: agg?.raised ?? 0 });
});

export const getCampaignById = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id).lean();
  if (!campaign) return fail(res, 404, "Campaign not found.");
  return ok(res, campaign);
});

export const createCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.create(req.body);
  return created(res, campaign);
});

export const updateCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!campaign) return fail(res, 404, "Campaign not found.");
  return ok(res, campaign);
});
