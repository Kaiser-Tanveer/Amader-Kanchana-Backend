import { Router } from "express";
import { loginHandler } from "@/controllers/authController";
import { validateBody } from "@/middleware/validate";
import { loginSchema } from "@/validators/issueValidators";

const router = Router();

router.post("/login", validateBody(loginSchema), loginHandler);

export default router;
