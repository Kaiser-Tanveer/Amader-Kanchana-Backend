import { Router } from "express";
import { listWards, getWardById, upsertWard } from "@/controllers/wardController";
import { requireAuth, requireRole } from "@/middleware/auth";

const router = Router();

router.get("/", listWards);
router.get("/:id", getWardById);
router.post("/", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), upsertWard);

export default router;
