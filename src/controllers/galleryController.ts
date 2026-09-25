import GalleryAlbum from "@/models/GalleryAlbum";
import { ok, created, fail } from "@/utils/apiResponse";
import { asyncHandler } from "@/middleware/errorHandler";

export const listGalleryAlbums = asyncHandler(async (_req, res) => {
  const albums = await GalleryAlbum.find().sort({ createdAt: -1 }).lean();
  return ok(res, albums);
});

export const createGalleryAlbum = asyncHandler(async (req, res) => {
  const album = await GalleryAlbum.create(req.body);
  return created(res, album);
});

export const addGalleryImage = asyncHandler(async (req, res) => {
  const album = await GalleryAlbum.findByIdAndUpdate(
    req.params.id,
    { $push: { images: req.body } },
    { new: true },
  );
  if (!album) return fail(res, 404, "Album not found.");
  return ok(res, album);
});
