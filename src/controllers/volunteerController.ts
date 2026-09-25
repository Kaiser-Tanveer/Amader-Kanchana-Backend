import Volunteer from "@/models/Volunteer";
import { ok, created } from "@/utils/apiResponse";
import { asyncHandler } from "@/middleware/errorHandler";

// Admin-only: returns volunteer contact info. Never exposed publicly.
export const listVolunteers = asyncHandler(async (_req, res) => {
  const volunteers = await Volunteer.find().sort({ createdAt: -1 }).lean();
  return ok(res, volunteers);
});

export const createVolunteerHandler = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.create(req.body);
  return created(res, { _id: volunteer._id });
});
