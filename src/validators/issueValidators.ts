import { z } from "zod";
import { ISSUE_STATUSES } from "@/models/Issue";

export const createIssueSchema = z.object({
  title: z.string().min(5),
  category: z.string().min(1),
  ward: z.string().min(1),
  area: z.string().min(2),
  description: z.string().min(10),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  reporter: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    })
    .optional(),
});

export const updateIssueStatusSchema = z.object({
  status: z.enum(ISSUE_STATUSES as [string, ...string[]]),
  note: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
