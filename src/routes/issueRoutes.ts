import { Router } from "express";
import {
  listIssues,
  getIssueById,
  createIssueHandler,
  updateIssueStatusHandler,
  listIssuesForAdmin,
} from "@/controllers/issueController";
import { requireAuth, requireRole } from "@/middleware/auth";
import { validateBody } from "@/middleware/validate";
import { createIssueSchema, updateIssueStatusSchema } from "@/validators/issueValidators";

const router = Router();

router.get("/", listIssues);
router.get("/admin", requireAuth, listIssuesForAdmin);
router.get("/:id", getIssueById);
router.post("/", validateBody(createIssueSchema), createIssueHandler);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("SUPER_ADMIN", "ADMIN", "MODERATOR"),
  validateBody(updateIssueStatusSchema),
  updateIssueStatusHandler,
);

export default router;
