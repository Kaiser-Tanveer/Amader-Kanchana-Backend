import { Router } from "express";
import { listVolunteers, createVolunteerHandler } from "@/controllers/volunteerController";
import { requireAuth, requireRole } from "@/middleware/auth";
import { validateBody } from "@/middleware/validate";
import { createVolunteerSchema } from "@/validators/formValidators";

const router = Router();

router.get("/", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), listVolunteers);
router.post("/", validateBody(createVolunteerSchema), createVolunteerHandler);

export default router;
