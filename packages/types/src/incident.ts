import { z } from "zod";

export const IncidentType = z.enum([
  "theft",
  "misconduct",
  "property_damage",
  "harassment",
  "safety_concern",
  "other",
]);
export type IncidentType = z.infer<typeof IncidentType>;

export const IncidentSeverity = z.enum(["low", "medium", "high", "critical"]);
export type IncidentSeverity = z.infer<typeof IncidentSeverity>;

export const IncidentStatus = z.enum([
  "submitted",
  "under_review",
  "substantiated",
  "unsubstantiated",
  "inconclusive",
  "appealed",
]);
export type IncidentStatus = z.infer<typeof IncidentStatus>;

export const IncidentEvidence = z.object({
  id: z.string().uuid(),
  incidentId: z.string().uuid(),
  type: z.enum(["photo", "video", "document", "other"]),
  storagePath: z.string(),
  uploadedAt: z.coerce.date(),
});
export type IncidentEvidence = z.infer<typeof IncidentEvidence>;

export const Incident = z.object({
  id: z.string().uuid(),
  reporterId: z.string().uuid(),
  workerId: z.string().uuid(),
  type: IncidentType,
  severity: IncidentSeverity,
  status: IncidentStatus,
  /** Encrypted description — never store or transmit in plaintext */
  descriptionEncrypted: z.string(),
  evidence: z.array(IncidentEvidence),
  reportedAt: z.coerce.date(),
  reviewedAt: z.coerce.date().nullable(),
  reviewerId: z.string().uuid().nullable(),
});
export type Incident = z.infer<typeof Incident>;

export const Appeal = z.object({
  id: z.string().uuid(),
  incidentId: z.string().uuid(),
  workerId: z.string().uuid(),
  reason: z.string().min(10).max(5000),
  status: z.enum(["pending", "accepted", "rejected"]),
  submittedAt: z.coerce.date(),
  reviewedAt: z.coerce.date().nullable(),
});
export type Appeal = z.infer<typeof Appeal>;
