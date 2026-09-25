import Issue, { ISSUE_STATUSES } from "@/models/Issue";
import { ok } from "@/utils/apiResponse";
import { asyncHandler } from "@/middleware/errorHandler";

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [totalIssues, verifiedIssues, inProgressIssues, resolvedIssues] = await Promise.all([
    Issue.countDocuments(),
    Issue.countDocuments({ status: "VERIFIED" }),
    Issue.countDocuments({ status: "IN_PROGRESS" }),
    Issue.countDocuments({ status: "RESOLVED" }),
  ]);

  const byCategoryAgg = await Issue.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
  const byWardAgg = await Issue.aggregate([{ $group: { _id: "$ward", count: { $sum: 1 } } }]);
  const byStatusAgg = await Issue.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

  const monthlyAgg = await Issue.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  // Ensure all statuses appear even with zero counts, for stable charts.
  const statusMap = new Map(byStatusAgg.map((s) => [s._id, s.count]));
  const issuesByStatus = ISSUE_STATUSES.map((status) => ({ status, count: statusMap.get(status) ?? 0 }));

  return ok(res, {
    totalIssues,
    verifiedIssues,
    inProgressIssues,
    resolvedIssues,
    issuesByCategory: byCategoryAgg.map((c) => ({ category: c._id, count: c.count })),
    issuesByWard: byWardAgg.map((w) => ({ ward: w._id, count: w.count })),
    issuesByStatus,
    monthlyTrend: monthlyAgg.map((m) => ({ month: m._id, count: m.count })),
  });
});
