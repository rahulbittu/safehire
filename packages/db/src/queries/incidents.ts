import type { SupabaseClient, Database } from "../client";

type IncidentInsert = Database["public"]["Tables"]["incidents"]["Insert"];
type IncidentUpdate = Database["public"]["Tables"]["incidents"]["Update"];
type _AppealInsert = Database["public"]["Tables"]["appeals"]["Insert"];

/**
 * Create a new incident report.
 * Description should already be encrypted before calling this function.
 */
export async function createIncident(
  client: SupabaseClient,
  incident: {
    reporterId: string;
    workerId: string;
    type: IncidentInsert["type"];
    severity: IncidentInsert["severity"];
    descriptionEncrypted: string;
  }
) {
  const { data, error } = await client
    .from("incidents")
    .insert({
      reporter_id: incident.reporterId,
      worker_id: incident.workerId,
      type: incident.type,
      severity: incident.severity,
      description_encrypted: incident.descriptionEncrypted,
      status: "submitted",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get a single incident by ID.
 */
export async function getIncidentById(client: SupabaseClient, incidentId: string) {
  const { data, error } = await client
    .from("incidents")
    .select("*, incident_evidence(*)")
    .eq("id", incidentId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all incidents for a specific worker.
 */
export async function getIncidentsForWorker(
  client: SupabaseClient,
  workerId: string,
  options?: { status?: Database["public"]["Tables"]["incidents"]["Row"]["status"] }
) {
  let query = client
    .from("incidents")
    .select("*, incident_evidence(*)", { count: "exact" })
    .eq("worker_id", workerId)
    .order("reported_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { incidents: data ?? [], total: count ?? 0 };
}

/**
 * Update the status of an incident.
 */
export async function updateIncidentStatus(
  client: SupabaseClient,
  incidentId: string,
  status: NonNullable<IncidentUpdate["status"]>,
  reviewerId: string
) {
  const { data, error } = await client
    .from("incidents")
    .update({
      status,
      reviewer_id: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", incidentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create an appeal for an incident.
 */
export async function createAppeal(
  client: SupabaseClient,
  appeal: {
    incidentId: string;
    workerId: string;
    reason: string;
  }
) {
  const { data, error } = await client
    .from("appeals")
    .insert({
      incident_id: appeal.incidentId,
      worker_id: appeal.workerId,
      reason: appeal.reason,
      status: "pending" as const,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
