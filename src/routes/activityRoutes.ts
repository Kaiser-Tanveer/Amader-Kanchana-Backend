import { Router } from "express";
import {
  listActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} from "@/controllers/activityController";
import { requireAuth, requireRole } from "@/middleware/auth";

const router = Router();

router.get("/", listActivities);
router.get("/:id", getActivityById);
router.post("/", requireAuth, requireRole("SUPER_ADMIN", "ADMIN", "EDITOR"), createActivity);
router.patch("/:id", requireAuth, requireRole("SUPER_ADMIN", "ADMIN", "EDITOR"), updateActivity);
router.delete("/:id", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), deleteActivity);

export default router;
