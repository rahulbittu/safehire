import { z } from "zod";

export const UserRole = z.enum(["worker", "hirer", "admin"]);
export type UserRole = z.infer<typeof UserRole>;

export const BaseUser = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  phone: z.string().min(10).max(15),
  role: UserRole,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type BaseUser = z.infer<typeof BaseUser>;

export const WorkerProfile = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  fullName: z.string().min(1).max(200),
  /** Never expose raw Aadhaar — this is a one-way hash */
  encryptedAadhaarHash: z.string().nullable(),
  photoUrl: z.string().url().nullable(),
  skills: z.array(z.string()),
  languages: z.array(z.string()),
  experienceYears: z.number().int().min(0),
  verifiedAt: z.coerce.date().nullable(),
});
export type WorkerProfile = z.infer<typeof WorkerProfile>;

export const HirerProfile = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1).max(200),
  organization: z.string().min(1).max(300),
  type: z.enum(["individual", "business", "agency"]),
});
export type HirerProfile = z.infer<typeof HirerProfile>;
