import Partner from "@/models/Partner";
import { ok, created } from "@/utils/apiResponse";
import { asyncHandler } from "@/middleware/errorHandler";

export const listPartners = asyncHandler(async (_req, res) => {
  const partners = await Partner.find().sort({ createdAt: -1 }).lean();
  return ok(res, partners);
});

export const createPartnerHandler = asyncHandler(async (req, res) => {
  const partner = await Partner.create(req.body);
  return created(res, { _id: partner._id });
});
