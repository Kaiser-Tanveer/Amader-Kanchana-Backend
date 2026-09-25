import type { Response } from "express";
import Issue from "@/models/Issue";
import { ok, created, fail } from "@/utils/apiResponse";
import { asyncHandler } from "@/middleware/errorHandler";
import { generateReferenceNumber } from "@/utils/referenceNumber";
import type { AuthenticatedRequest } from "@/middleware/auth";

// Fields to strip from every public-facing issue response.
const PUBLIC_EXCLUDE = "-reporter";

export const listIssues = asyncHandler(async (req, res: Response) => {
  const { search, ward, category, status, page = "1", limit = "20" } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = { isPublic: true };
  if (ward) filter.ward = ward;
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { area: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

  const issues = await Issue.find(filter, PUBLIC_EXCLUDE)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .lean();

  return ok(res, issues);
});

export const getIssueById = asyncHandler(async (req, res: Response) => {
  const issue = await Issue.findById(req.params.id, PUBLIC_EXCLUDE).lean();
  if (!issue) return fail(res, 404, "Issue not found.");
  return ok(res, issue);
});

export const createIssueHandler = asyncHandler(async (req, res: Response) => {
  const referenceNumber = await generateReferenceNumber();

  const issue = await Issue.create({
    ...req.body,
    referenceNumber,
    status: "SUBMITTED",
    updates: [{ status: "SUBMITTED", note: "Report submitted." }],
  });

  return created(res, { _id: issue._id, referenceNumber: issue.referenceNumber });
});

export const updateIssueStatusHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, note } = req.body;

  const issue = await Issue.findById(req.params.id);
  if (!issue) return fail(res, 404, "Issue not found.");

  issue.status = status;
  issue.updates.push({
    status,
    note,
    updatedBy: req.user ? (req.user.userId as never) : undefined,
  } as never);
  await issue.save();

  return ok(res, issue.toObject());
});

// Admin-only listing that includes reporter data for verification purposes.
export const listIssuesForAdmin = asyncHandler(async (req, res: Response) => {
  const { search, ward, category, status } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = {};
  if (ward) filter.ward = ward;
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { area: { $regex: search, $options: "i" } },
    ];
  }

  const issues = await Issue.find(filter).sort({ createdAt: -1 }).lean();
  return ok(res, issues);
});
