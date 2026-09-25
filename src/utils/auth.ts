import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "@/config/env";
import type { AdminRole } from "@/models/User";

export interface TokenPayload {
  userId: string;
  role: AdminRole;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
};

export const hashPassword = async (plain: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

export const comparePassword = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};
