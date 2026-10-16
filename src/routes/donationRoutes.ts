import express, { Router } from "express";
import {
  initiateDonation,
  handleIpn,
  getDonationStatus,
  getManualPaymentInfo,
  submitManualDonation,
  verifyManualDonation,
  listDonationsForAdmin,
  getPublicDonationStats,
} from "@/controllers/donationController";
import { requireAuth, requireRole } from "@/middleware/auth";

const router = Router();

// Gateway (SSLCommerz)
router.post("/initiate", initiateDonation);
// SSLCommerz posts form-encoded data, so this route needs its own body parser.
router.post("/ipn", express.urlencoded({ extended: true }), handleIpn);

// Manual (free) payments
router.get("/manual-info", getManualPaymentInfo);
router.post("/manual", submitManualDonation);
router.patch("/:id/verify", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), verifyManualDonation);

router.get("/status/:tranId", getDonationStatus);
router.get("/stats", getPublicDonationStats);
router.get("/admin", requireAuth, requireRole("SUPER_ADMIN", "ADMIN"), listDonationsForAdmin);

export default router;
