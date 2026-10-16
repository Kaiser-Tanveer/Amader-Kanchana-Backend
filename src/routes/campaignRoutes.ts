import { Router } from "express";
import {
  listActiveCampaigns,
  getActiveEmergencyCampaign,
  getCampaignById,
  createCampaign,
  updateCampaign,
} from "@/controllers/campaignController";
import { requireAuth, requireRole } from "@/middleware/auth";

const router = Router();

router.get("/", listActiveCampaigns);
router.get("/emergency", getActiveEmergencyCampaign);
router.get("/:id", getCampaignById);
router.post("/", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), createCampaign);
router.patch("/:id", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), updateCampaign);

export default router;
