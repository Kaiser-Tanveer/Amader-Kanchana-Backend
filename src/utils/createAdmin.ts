import "dotenv/config";
import mongoose from "mongoose";
import { env } from "@/config/env";
import User, { type AdminRole } from "@/models/User";
import { hashPassword } from "@/utils/auth";

// Usage:
//   npx ts-node -r tsconfig-paths/register src/utils/createAdmin.ts "Full Name" email@example.com somePassword ADMIN
//
// Role must be one of: SUPER_ADMIN | ADMIN | EDITOR | MODERATOR
// If omitted, defaults to ADMIN.

const [, , name, email, password, roleArg] = process.argv;

const run = async () => {
  if (!name || !email || !password) {
    console.error(
      'Usage: npx ts-node -r tsconfig-paths/register src/utils/createAdmin.ts "Full Name" email@example.com password [ROLE]',
    );
    process.exit(1);
  }

  const role = (roleArg ?? "ADMIN") as AdminRole;
  const validRoles: AdminRole[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "MODERATOR"];
  if (!validRoles.includes(role)) {
    console.error(`Invalid role "${role}". Must be one of: ${validRoles.join(", ")}`);
    process.exit(1);
  }

  await mongoose.connect(env.mongodbUri);
  console.log(`[create-admin] Connected to database: ${mongoose.connection.name}`);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`[create-admin] A user with email ${email} already exists. Updating their password and role instead.`);
    existing.passwordHash = await hashPassword(password);
    existing.role = role;
    existing.name = name;
    existing.isActive = true;
    await existing.save();
    console.log(`[create-admin] Updated: ${email} (${role})`);
  } else {
    await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      role,
    });
    console.log(`[create-admin] Created new admin: ${email} (${role})`);
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("[create-admin] Failed:", err);
  process.exit(1);
});