import type { Response } from "express";

export const ok = <T>(res: Response, data: T, message?: string, status = 200) => {
  return res.status(status).json({ success: true, data, message });
};

export const created = <T>(res: Response, data: T, message?: string) => ok(res, data, message, 201);

export const fail = (res: Response, status: number, message: string) => {
  return res.status(status).json({ success: false, data: null, message });
};
