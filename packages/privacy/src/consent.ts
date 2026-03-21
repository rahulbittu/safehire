import type { SupabaseClient } from "@verifyme/db";

interface ConsentParams {
  workerId: string;
  hirerId: string;
  fields: string[];
  expiresAt: Date;
}

/**
 * Manages consent grants between workers and hirers.
 * Workers must explicitly grant consent before hirers can view their data.
 */
export class ConsentManager {
  constructor(private client: SupabaseClient) {}

  /**
   * Grant consent for a hirer to view specific worker fields.
   * TODO: Validate that the fields requested are valid and classifiable.
   * TODO: Notify the hirer that consent has been granted.
   */
  async grantConsent(params: ConsentParams): Promise<{ id: string }> {
    // TODO: Insert consent grant into database
    // TODO: Log consent change in audit log
    const { data, error } = await this.client
      .from("consent_grants")
      .insert({
        worker_id: params.workerId,
        hirer_id: params.hirerId,
        fields: params.fields,
        granted_at: new Date().toISOString(),
        expires_at: params.expiresAt.toISOString(),
        revoked_at: null,
      })
      .select("id")
      .single();

    if (error) throw error;
    return { id: (data as Record<string, unknown>).id as string };
  }

  /**
   * Revoke a previously granted consent.
   * Immediately prevents further data access.
   */
  async revokeConsent(consentId: string): Promise<void> {
    // TODO: Log consent revocation in audit log
    const { error } = await this.client
      .from("consent_grants")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", consentId);

    if (error) throw error;
  }

  /**
   * Check if a hirer has active consent to view a worker's data.
   * Returns the granted fields if consent is active, null otherwise.
   */
  async checkConsent(
    workerId: string,
    hirerId: string
  ): Promise<{ fields: string[] } | null> {
    const { data, error } = await this.client
      .from("consent_grants")
      .select("fields")
      .eq("worker_id", workerId)
      .eq("hirer_id", hirerId)
      .is("revoked_at", null)
      .gte("expires_at", new Date().toISOString())
      .order("granted_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code === "PGRST116") return null;
    if (error) throw error;

    return { fields: (data as Record<string, unknown>).fields as string[] };
  }

  /**
   * Get all active consent grants for a worker.
   */
  async getActiveConsents(workerId: string) {
    const { data, error } = await this.client
      .from("consent_grants")
      .select("*")
      .eq("worker_id", workerId)
      .is("revoked_at", null)
      .gte("expires_at", new Date().toISOString());

    if (error) throw error;
    return data ?? [];
  }
}
