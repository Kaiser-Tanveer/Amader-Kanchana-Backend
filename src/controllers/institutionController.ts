import Institution from "@/models/Institution";
import { ok, created, fail } from "@/utils/apiResponse";
import { asyncHandler } from "@/middleware/errorHandler";

export const listInstitutions = asyncHandler(async (req, res) => {
  const { category, ward } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (ward) filter.ward = ward;

  const institutions = await Institution.find(filter).sort({ name: 1 }).lean();
  return ok(res, institutions);
});

export const getInstitutionById = asyncHandler(async (req, res) => {
  const institution = await Institution.findById(req.params.id).lean();
  if (!institution) return fail(res, 404, "Institution not found.");
  return ok(res, institution);
});

export const createInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.create(req.body);
  return created(res, institution);
});

export const updateInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!institution) return fail(res, 404, "Institution not found.");
  return ok(res, institution);
});

export const deleteInstitution = asyncHandler(async (req, res) => {
  const institution = await Institution.findByIdAndDelete(req.params.id);
  if (!institution) return fail(res, 404, "Institution not found.");
  return ok(res, { deleted: true });
});
