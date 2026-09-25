import { Router } from "express";
import {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "@/controllers/projectController";
import { requireAuth, requireRole } from "@/middleware/auth";

const router = Router();

router.get("/", listProjects);
router.get("/:id", getProjectById);
router.post("/", requireAuth, requireRole("SUPER_ADMIN", "ADMIN", "EDITOR"), createProject);
router.patch("/:id", requireAuth, requireRole("SUPER_ADMIN", "ADMIN", "EDITOR"), updateProject);
router.delete("/:id", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), deleteProject);

export default router;
