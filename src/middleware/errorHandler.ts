import type { Request, Response, NextFunction } from "express";
import { fail } from "@/utils/apiResponse";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const notFoundHandler = (req: Request, res: Response) => {
  fail(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error("[error]", err);

  if (err instanceof ApiError) {
    return fail(res, err.status, err.message);
  }

  if (err instanceof Error && err.name === "ValidationError") {
    return fail(res, 400, err.message);
  }

  if (err instanceof Error && (err as { code?: number }).code === 11000) {
    return fail(res, 409, "A record with this value already exists.");
  }

  const message = err instanceof Error ? err.message : "Unexpected server error.";
  return fail(res, 500, message);
};

export const asyncHandler =
  <T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
