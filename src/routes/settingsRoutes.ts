import { Router } from "express";
import { getSiteSettings, updateSiteSettings } from "@/controllers/settingsController";
import { requireAuth, requireRole } from "@/middleware/auth";

const router = Router();

router.get("/", getSiteSettings);
router.patch("/", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), updateSiteSettings);

export default router;
