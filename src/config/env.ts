import dotenv from "dotenv";

dotenv.config();

const required = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongodbUri: required("MONGODB_URI", "mongodb://localhost:27017/kanchana"),
  jwtSecret: required("JWT_SECRET", "dev_only_secret_change_me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  storageDriver: (process.env.STORAGE_DRIVER ?? "local") as "local" | "cloudinary" | "firebase" | "s3",
  seedDemoData: (process.env.SEED_DEMO_DATA ?? "true") === "true",
  seedSuperAdminEmail: process.env.SEED_SUPER_ADMIN_EMAIL ?? "admin@amaderkanchana.local",
  seedSuperAdminPassword: process.env.SEED_SUPER_ADMIN_PASSWORD ?? "change_this_password",
};
