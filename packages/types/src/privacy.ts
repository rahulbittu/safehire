import { z } from "zod";

export const DataClassification = z.enum([
  "public",
  "restricted",
  "sensitive",
  "highly_sensitive",
]);
export type DataClassification = z.infer<typeof DataClassification>;

export const ConsentGrant = z.object({
  id: z.string().uuid(),
  workerId: z.string().uuid(),
  hirerId: z.string().uuid(),
  /** Which fields the worker has consented to share */
  fields: z.array(z.string()),
  grantedAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
  revokedAt: z.coerce.date().nullable(),
});
export type ConsentGrant = z.infer<typeof ConsentGrant>;

export const DisclosureRequest = z.object({
  id: z.string().uuid(),
  requesterType: z.enum(["law_enforcement", "employer", "regulator", "other"]),
  requesterId: z.string().uuid(),
  workerId: z.string().uuid(),
  legalBasis: z.string().min(1),
  status: z.enum(["pending", "approved", "denied"]),
  documents: z.array(
    z.object({
      name: z.string(),
      storagePath: z.string(),
    })
  ),
  requestedAt: z.coerce.date(),
  processedAt: z.coerce.date().nullable(),
  processorId: z.string().uuid().nullable(),
});
export type DisclosureRequest = z.infer<typeof DisclosureRequest>;

export const AuditLogEntry = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid(),
  action: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  metadata: z.record(z.unknown()).nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.coerce.date(),
});
export type AuditLogEntry = z.infer<typeof AuditLogEntry>;
