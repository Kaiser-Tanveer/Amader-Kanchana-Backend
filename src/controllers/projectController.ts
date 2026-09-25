import Project from "@/models/Project";
import { ok, created, fail } from "@/utils/apiResponse";
import { asyncHandler } from "@/middleware/errorHandler";

export const listProjects = asyncHandler(async (req, res) => {
  const { category, status, ward } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (ward) filter.ward = ward;

  const projects = await Project.find(filter).sort({ createdAt: -1 }).lean();
  return ok(res, projects);
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).lean();
  if (!project) return fail(res, 404, "Project not found.");
  return ok(res, project);
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create(req.body);
  return created(res, project);
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!project) return fail(res, 404, "Project not found.");
  return ok(res, project);
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return fail(res, 404, "Project not found.");
  return ok(res, { deleted: true });
});
