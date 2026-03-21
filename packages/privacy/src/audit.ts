import type { SupabaseClient } from "@verifyme/db";

interface AuditEntry {
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Audit logger for tracking all data access and modifications.
 * Every read or write of sensitive data must be logged.
 */
export class AuditLogger {
  constructor(private client: SupabaseClient) {}

  /**
   * Log a data access event (e.g., hirer viewed a trust card).
   */
  async logDataAccess(params: {
    actorId: string;
    resourceType: string;
    resourceId: string;
    fieldsAccessed: string[];
    ipAddress?: string;
  }): Promise<void> {
    await this._write({
      actorId: params.actorId,
      action: "data_access",
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: { fieldsAccessed: params.fieldsAccessed },
      ipAddress: params.ipAddress,
    });
  }

  /**
   * Log a consent change event.
   */
  async logConsentChange(params: {
    actorId: string;
    consentId: string;
    action: "granted" | "revoked" | "expired";
    workerId: string;
    hirerId: string;
  }): Promise<void> {
    await this._write({
      actorId: params.actorId,
      action: `consent_${params.action}`,
      resourceType: "consent_grant",
      resourceId: params.consentId,
      metadata: {
        workerId: params.workerId,
        hirerId: params.hirerId,
      },
    });
  }

  /**
   * Log a disclosure event (data shared with third party or law enforcement).
   */
  async logDisclosure(params: {
    actorId: string;
    disclosureRequestId: string;
    workerId: string;
    requesterType: string;
    fieldsDisclosed: string[];
    legalBasis: string;
  }): Promise<void> {
    await this._write({
      actorId: params.actorId,
      action: "disclosure",
      resourceType: "disclosure_request",
      resourceId: params.disclosureRequestId,
      metadata: {
        workerId: params.workerId,
        requesterType: params.requesterType,
        fieldsDisclosed: params.fieldsDisclosed,
        legalBasis: params.legalBasis,
      },
    });
  }

  /**
   * Log a generic audit event.
   */
  async log(entry: AuditEntry): Promise<void> {
    return this._write(entry);
  }

  /**
   * Write an audit log entry to the database.
   * TODO: Consider also writing to an immutable external log (e.g., append-only S3 bucket)
   * for tamper resistance.
   */
  private async _write(entry: AuditEntry): Promise<void> {
    const { error } = await this.client.from("audit_log").insert({
      actor_id: entry.actorId,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId,
      metadata: entry.metadata ?? null,
      ip_address: entry.ipAddress ?? null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Audit logging should not break the main flow — log the error
      // but do not throw. In production, send to error monitoring.
      // TODO: Wire up error reporting (e.g., Sentry)
      console.error("Failed to write audit log:", error);
    }
  }
}
