import type { SupabaseClient, Database } from "../client";

type WorkerProfileInsert = Database["public"]["Tables"]["worker_profiles"]["Insert"];

/**
 * Get a worker profile by user ID.
 */
export async function getWorkerById(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("worker_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get a worker by phone number (via users table join).
 */
export async function getWorkerByPhone(client: SupabaseClient, phone: string) {
  const { data, error } = await client
    .from("users")
    .select("*, worker_profiles(*)")
    .eq("phone", phone)
    .eq("role", "worker")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Search workers by query and filters.
 * Only returns non-PII fields suitable for search results.
 */
export async function searchWorkers(
  client: SupabaseClient,
  params: {
    query?: string;
    skills?: string[];
    languages?: string[];
    minExperienceYears?: number;
    category?: string;
    locality?: string;
    page: number;
    limit: number;
  }
) {
  let queryBuilder = client
    .from("worker_profiles")
    .select("id, user_id, full_name, skills, languages, experience_years, verified_at, category, locality, availability, agency_id", {
      count: "exact",
    });

  if (params.minExperienceYears !== undefined) {
    queryBuilder = queryBuilder.gte("experience_years", params.minExperienceYears);
  }

  if (params.category !== undefined) {
    queryBuilder = queryBuilder.eq("category", params.category);
  }

  if (params.locality !== undefined) {
    queryBuilder = queryBuilder.ilike("locality", `%${params.locality}%`);
  }

  const offset = (params.page - 1) * params.limit;
  queryBuilder = queryBuilder.range(offset, offset + params.limit - 1);

  const { data, error, count } = await queryBuilder;

  if (error) throw error;
  return { workers: data ?? [], total: count ?? 0 };
}

/**
 * Create a new worker profile.
 */
export async function createWorkerProfile(
  client: SupabaseClient,
  profile: {
    userId: string;
    fullName: string;
    skills: string[];
    languages: string[];
    experienceYears: number;
    encryptedAadhaarHash?: string;
    photoUrl?: string;
    category?: string;
    locality?: string;
  }
) {
  const insert: WorkerProfileInsert = {
    user_id: profile.userId,
    full_name: profile.fullName,
    skills: profile.skills,
    languages: profile.languages,
    experience_years: profile.experienceYears,
    encrypted_aadhaar_hash: profile.encryptedAadhaarHash ?? null,
    photo_url: profile.photoUrl ?? null,
    category: profile.category ?? null,
    locality: profile.locality ?? null,
  };

  const { data, error } = await client
    .from("worker_profiles")
    .insert(insert)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing worker profile.
 */
export async function updateWorkerProfile(
  client: SupabaseClient,
  userId: string,
  updates: {
    fullName?: string;
    skills?: string[];
    languages?: string[];
    experienceYears?: number;
    photoUrl?: string;
    category?: string;
    locality?: string;
  }
) {
  const dbUpdates: Database["public"]["Tables"]["worker_profiles"]["Update"] = {};
  if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
  if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
  if (updates.languages !== undefined) dbUpdates.languages = updates.languages;
  if (updates.experienceYears !== undefined) dbUpdates.experience_years = updates.experienceYears;
  if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.locality !== undefined) dbUpdates.locality = updates.locality;

  const { data, error } = await client
    .from("worker_profiles")
    .update(dbUpdates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
