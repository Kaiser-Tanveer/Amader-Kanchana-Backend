import { Router } from "express";
import {
  listInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
} from "@/controllers/institutionController";
import { requireAuth, requireRole } from "@/middleware/auth";

const router = Router();

router.get("/", listInstitutions);
router.get("/:id", getInstitutionById);
router.post("/", requireAuth, requireRole("SUPER_ADMIN", "ADMIN", "EDITOR"), createInstitution);
router.patch("/:id", requireAuth, requireRole("SUPER_ADMIN", "ADMIN", "EDITOR"), updateInstitution);
router.delete("/:id", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), deleteInstitution);

export default router;
