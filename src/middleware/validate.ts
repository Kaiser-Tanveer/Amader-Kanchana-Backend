import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { fail } from "@/utils/apiResponse";

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return fail(res, 400, result.error.issues.map((i) => i.message).join(", "));
    }
    req.body = result.data;
    next();
  };
};
