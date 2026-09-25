import Issue from "@/models/Issue";

// Generates sequential, human-readable reference numbers like KAN-2026-000001.
export const generateReferenceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const prefix = `KAN-${year}-`;

  const lastIssue = await Issue.findOne({ referenceNumber: { $regex: `^${prefix}` } })
    .sort({ createdAt: -1 })
    .lean();

  let nextSeq = 1;
  if (lastIssue?.referenceNumber) {
    const lastSeq = parseInt(lastIssue.referenceNumber.split("-")[2], 10);
    if (!Number.isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(6, "0")}`;
};
