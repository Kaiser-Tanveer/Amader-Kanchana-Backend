import Member from "@/models/Member";
import Donation from "@/models/Donation";
import { ok, created, fail } from "@/utils/apiResponse";
import { asyncHandler } from "@/middleware/errorHandler";

// Admin-only: list members plus whether they've paid the current month's due.
export const listMembers = asyncHandler(async (_req, res) => {
  const members = await Member.find().sort({ name: 1 }).lean();
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  const withDueStatus = await Promise.all(
    members.map(async (m) => {
      const paidThisMonth = await Donation.exists({
        member: m._id,
        dueMonth: currentMonth,
        status: "SUCCESS",
      });
      return { ...m, currentMonthPaid: Boolean(paidThisMonth) };
    }),
  );

  return ok(res, withDueStatus);
});

export const createMember = asyncHandler(async (req, res) => {
  const member = await Member.create(req.body);
  return created(res, member);
});

export const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!member) return fail(res, 404, "Member not found.");
  return ok(res, member);
});

// Used by the "pay my monthly due" flow — looks a member up by phone number.
export const findMemberByPhone = asyncHandler(async (req, res) => {
  const member = await Member.findOne({ phone: req.params.phone, isActive: true })
    .select("name monthlyDueAmount")
    .lean();
  if (!member) return fail(res, 404, "No active member found with this phone number.");
  // Deliberately minimal: this endpoint is public, so it must not reveal email,
  // ward or other details to someone who merely guesses a phone number.
  return ok(res, { ...member, phone: req.params.phone });
});

// Admin-only: this member's full payment history.
export const getMemberDuesHistory = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ member: req.params.id, purpose: "MEMBERSHIP_DUE" })
    .select("-rawGatewayResponse")
    .sort({ createdAt: -1 })
    .lean();
  return ok(res, donations);
});
