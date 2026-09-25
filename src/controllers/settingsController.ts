import SiteSetting from "@/models/SiteSetting";
import { ok } from "@/utils/apiResponse";
import { asyncHandler } from "@/middleware/errorHandler";

export const getSiteSettings = asyncHandler(async (_req, res) => {
  let settings = await SiteSetting.findOne();
  if (!settings) settings = await SiteSetting.create({});
  return ok(res, settings);
});

export const updateSiteSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSetting.findOneAndUpdate({}, req.body, { new: true, upsert: true });
  return ok(res, settings);
});
