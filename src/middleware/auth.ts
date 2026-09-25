import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/utils/auth";
import { fail } from "@/utils/apiResponse";
import type { AdminRole } from "@/models/User";

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; role: AdminRole };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return fail(res, 401, "Authentication required.");
  }

  try {
    const payload = verifyToken(header.replace("Bearer ", ""));
    req.user = payload;
    next();
  } catch {
    return fail(res, 401, "Invalid or expired token.");
  }
};

export const requireRole = (...roles: AdminRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return fail(res, 401, "Authentication required.");
    if (!roles.includes(req.user.role)) {
      return fail(res, 403, "You do not have permission to perform this action.");
    }
    next();
  };
};
