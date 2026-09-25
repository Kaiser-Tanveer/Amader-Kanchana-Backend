import { Router } from "express";
import { listPartners, createPartnerHandler } from "@/controllers/partnerController";
import { requireAuth, requireRole } from "@/middleware/auth";
import { validateBody } from "@/middleware/validate";
import { createPartnerSchema } from "@/validators/formValidators";

const router = Router();

router.get("/", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), listPartners);
router.post("/", validateBody(createPartnerSchema), createPartnerHandler);

export default router;
