import Activity from "@/models/Activity";
import { ok, created, fail } from "@/utils/apiResponse";
import { asyncHandler } from "@/middleware/errorHandler";

export const listActivities = asyncHandler(async (req, res) => {
  const { category } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = { isPublished: true };
  if (category) filter.category = category;

  const activities = await Activity.find(filter).sort({ date: -1 }).lean();
  return ok(res, activities);
});

export const getActivityById = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id).lean();
  if (!activity) return fail(res, 404, "Activity not found.");
  return ok(res, activity);
});

export const createActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.create(req.body);
  return created(res, activity);
});

export const updateActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!activity) return fail(res, 404, "Activity not found.");
  return ok(res, activity);
});

export const deleteActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findByIdAndDelete(req.params.id);
  if (!activity) return fail(res, 404, "Activity not found.");
  return ok(res, { deleted: true });
});
