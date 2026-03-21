import { z } from "zod";

export const VerificationTier = z.enum(["unverified", "basic", "enhanced"]);
export type VerificationTier = z.infer<typeof VerificationTier>;

export const TrustCard = z.object({
  workerId: z.string().uuid(),
  tier: VerificationTier,
  verificationStatus: z.enum(["pending", "verified", "expired", "rejected"]),
  tenureMonths: z.number().int().min(0),
  endorsementCount: z.number().int().min(0),
  incidentFlag: z.boolean(),
  /** Highest severity among substantiated incidents, if any */
  incidentSeverityMax: z.enum(["low", "medium", "high", "critical"]).nullable(),
  lastUpdated: z.coerce.date(),
});
export type TrustCard = z.infer<typeof TrustCard>;

export const TrustSignal = z.object({
  type: z.enum(["verification", "tenure", "endorsement", "incident"]),
  label: z.string(),
  value: z.number(),
  weight: z.number(),
});
export type TrustSignal = z.infer<typeof TrustSignal>;

export const EndorsementSummary = z.object({
  workerId: z.string().uuid(),
  totalCount: z.number().int().min(0),
  recentEndorsements: z.array(
    z.object({
      hirerId: z.string().uuid(),
      hirerName: z.string(),
      relationship: z.string(),
      comment: z.string().nullable(),
      createdAt: z.coerce.date(),
    })
  ),
});
export type EndorsementSummary = z.infer<typeof EndorsementSummary>;
