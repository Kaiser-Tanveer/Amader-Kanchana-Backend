import { Router } from "express";
import issueRoutes from "./issueRoutes";
import wardRoutes from "./wardRoutes";
import institutionRoutes from "./institutionRoutes";
import projectRoutes from "./projectRoutes";
import activityRoutes from "./activityRoutes";
import galleryRoutes from "./galleryRoutes";
import volunteerRoutes from "./volunteerRoutes";
import partnerRoutes from "./partnerRoutes";
import authRoutes from "./authRoutes";
import dashboardRoutes from "./dashboardRoutes";
import settingsRoutes from "./settingsRoutes";

const router = Router();

router.use("/issues", issueRoutes);
router.use("/wards", wardRoutes);
router.use("/institutions", institutionRoutes);
router.use("/projects", projectRoutes);
router.use("/activities", activityRoutes);
router.use("/gallery", galleryRoutes);
router.use("/volunteers", volunteerRoutes);
router.use("/partners", partnerRoutes);
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/settings", settingsRoutes);

export default router;
