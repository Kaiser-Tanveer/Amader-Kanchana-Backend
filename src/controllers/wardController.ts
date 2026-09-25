import Ward from "@/models/Ward";
import { ok, fail } from "@/utils/apiResponse";
import { asyncHandler } from "@/middleware/errorHandler";

export const listWards = asyncHandler(async (_req, res) => {
  const wards = await Ward.find().sort({ number: 1 }).lean();
  return ok(res, wards);
});

export const getWardById = asyncHandler(async (req, res) => {
  const ward = await Ward.findById(req.params.id).lean();
  if (!ward) return fail(res, 404, "Ward not found.");
  return ok(res, ward);
});

export const upsertWard = asyncHandler(async (req, res) => {
  const { number, ...rest } = req.body;
  const ward = await Ward.findOneAndUpdate({ number }, rest, { upsert: true, new: true });
  return ok(res, ward);
});
