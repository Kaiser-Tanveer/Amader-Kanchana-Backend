import { Router } from "express";
import { listGalleryAlbums, createGalleryAlbum, addGalleryImage } from "@/controllers/galleryController";
import { requireAuth, requireRole } from "@/middleware/auth";

const router = Router();

router.get("/albums", listGalleryAlbums);
router.post("/albums", requireAuth, requireRole("SUPER_ADMIN", "ADMIN", "EDITOR"), createGalleryAlbum);
router.post("/albums/:id/images", requireAuth, requireRole("SUPER_ADMIN", "ADMIN", "EDITOR"), addGalleryImage);

export default router;
