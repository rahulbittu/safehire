import type { SupabaseClient, Database } from "../client";

type TrustCardInsert = Database["public"]["Tables"]["trust_cards"]["Insert"];

/**
 * Get the trust card for a worker.
 */
export async function getTrustCard(client: SupabaseClient, workerId: string) {
  const { data, error } = await client
    .from("trust_cards")
    .select("*")
    .eq("worker_id", workerId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
  return data;
}

/**
 * Insert or update a trust card for a worker.
 */
export async function upsertTrustCard(
  client: SupabaseClient,
  trustCard: {
    workerId: string;
    tier: NonNullable<TrustCardInsert["tier"]>;
    verificationStatus: NonNullable<TrustCardInsert["verification_status"]>;
    tenureMonths: number;
    endorsementCount: number;
    incidentFlag: boolean;
    incidentSeverityMax: TrustCardInsert["incident_severity_max"];
  }
) {
  const { data, error } = await client
    .from("trust_cards")
    .upsert(
      {
        worker_id: trustCard.workerId,
        tier: trustCard.tier,
        verification_status: trustCard.verificationStatus,
        tenure_months: trustCard.tenureMonths,
        endorsement_count: trustCard.endorsementCount,
        incident_flag: trustCard.incidentFlag,
        incident_severity_max: trustCard.incidentSeverityMax,
        last_computed_at: new Date().toISOString(),
      },
      { onConflict: "worker_id" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all verifications for a worker.
 */
export async function getVerifications(client: SupabaseClient, workerId: string) {
  const { data, error } = await client
    .from("verifications")
    .select("*")
    .eq("worker_id", workerId)
    .order("verified_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Get all endorsements for a worker.
 */
export async function getEndorsements(client: SupabaseClient, workerId: string) {
  const { data, error } = await client
    .from("endorsements")
    .select("*")
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/**
 * Create an endorsement for a worker.
 */
export async function createEndorsement(
  client: SupabaseClient,
  endorsement: {
    workerId: string;
    hirerId: string;
    relationship: string;
    comment?: string | null;
  }
) {
  const { data, error } = await client
    .from("endorsements")
    .insert({
      worker_id: endorsement.workerId,
      hirer_id: endorsement.hirerId,
      relationship: endorsement.relationship,
      comment: endorsement.comment ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Count endorsements for a worker.
 */
export async function countEndorsements(client: SupabaseClient, workerId: string) {
  const { count, error } = await client
    .from("endorsements")
    .select("*", { count: "exact", head: true })
    .eq("worker_id", workerId);

  if (error) throw error;
  return count ?? 0;
}
