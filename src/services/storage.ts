import path from "path";
import fs from "fs";
import { env } from "@/config/env";

export interface StoredFile {
  url: string;
  key: string;
}

interface StorageDriver {
  save: (buffer: Buffer, originalName: string, mimeType: string) => Promise<StoredFile>;
}

// Local disk driver — default for development. Files are written to
// /uploads and served statically by Express (see app.ts).
const localDriver: StorageDriver = {
  save: async (buffer, originalName) => {
    const uploadsDir = path.join(__dirname, "..", "..", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${originalName.replace(/\s+/g, "_")}`;
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);

    return { url: `/uploads/${filename}`, key: filename };
  },
};

// Cloudinary / Firebase / S3 drivers are intentionally left as thin stubs.
// Wire up the relevant SDK here and switch STORAGE_DRIVER in .env — nothing
// else in the codebase needs to change, since all callers use `storage.save()`.
const cloudinaryDriver: StorageDriver = {
  save: async () => {
    throw new Error("Cloudinary storage driver is not configured yet. Implement it in storage.ts.");
  },
};

const firebaseDriver: StorageDriver = {
  save: async () => {
    throw new Error("Firebase storage driver is not configured yet. Implement it in storage.ts.");
  },
};

const s3Driver: StorageDriver = {
  save: async () => {
    throw new Error("S3 storage driver is not configured yet. Implement it in storage.ts.");
  },
};

const drivers: Record<string, StorageDriver> = {
  local: localDriver,
  cloudinary: cloudinaryDriver,
  firebase: firebaseDriver,
  s3: s3Driver,
};

export const storage = drivers[env.storageDriver] ?? localDriver;
