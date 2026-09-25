import { z } from "zod";

export const createVolunteerSchema = z.object({
  name: z.string().min(2),
  mobile: z.string().min(6),
  email: z.string().email().optional(),
  ward: z.string().min(1),
  profession: z.string().optional(),
  interests: z.array(z.string()).min(1),
  skills: z.string().optional(),
  availability: z.string().optional(),
  message: z.string().optional(),
});

export const createPartnerSchema = z.object({
  orgName: z.string().min(2),
  category: z.string().min(1),
  contact: z.string().min(3),
  message: z.string().optional(),
});
