import { Router } from "express";
import {
  listMembers,
  createMember,
  updateMember,
  findMemberByPhone,
  getMemberDuesHistory,
} from "@/controllers/memberController";
import { requireAuth, requireRole } from "@/middleware/auth";

const router = Router();

router.get("/lookup/:phone", findMemberByPhone); // public — used by the "pay my due" form
router.get("/", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), listMembers);
router.get("/:id/dues", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), getMemberDuesHistory);
router.post("/", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), createMember);
router.patch("/:id", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), updateMember);

export default router;
