import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Database type definitions matching supabase/migrations/00001_initial_schema.sql.
 *
 * In production, generate these with: `supabase gen types typescript`
 * These hand-written types cover the vertical slice and will be replaced
 * by auto-generated types once a Supabase project is connected.
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string;
          email: string | null;
          role: "worker" | "hirer" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          email?: string | null;
          role: "worker" | "hirer" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          email?: string | null;
          role?: "worker" | "hirer" | "admin";
          updated_at?: string;
        };
        Relationships: [];
      };
      worker_profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          encrypted_aadhaar_hash: string | null;
          photo_url: string | null;
          skills: string[];
          languages: string[];
          experience_years: number;
          verified_at: string | null;
          category: string | null;
          locality: string | null;
          availability: string | null;
          agency_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          encrypted_aadhaar_hash?: string | null;
          photo_url?: string | null;
          skills?: string[];
          languages?: string[];
          experience_years?: number;
          verified_at?: string | null;
          category?: string | null;
          locality?: string | null;
          availability?: string | null;
          agency_id?: string | null;
        };
        Update: {
          full_name?: string;
          encrypted_aadhaar_hash?: string | null;
          photo_url?: string | null;
          skills?: string[];
          languages?: string[];
          experience_years?: number;
          verified_at?: string | null;
          category?: string | null;
          locality?: string | null;
          availability?: string | null;
          agency_id?: string | null;
        };
        Relationships: [];
      };
      hirer_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          organization: string;
          type: "individual" | "business" | "agency";
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          organization: string;
          type: "individual" | "business" | "agency";
        };
        Update: {
          name?: string;
          organization?: string;
          type?: "individual" | "business" | "agency";
        };
        Relationships: [];
      };
      trust_cards: {
        Row: {
          id: string;
          worker_id: string;
          tier: "unverified" | "basic" | "enhanced";
          verification_status: "pending" | "verified" | "expired" | "rejected";
          tenure_months: number;
          endorsement_count: number;
          incident_flag: boolean;
          incident_severity_max: "low" | "medium" | "high" | "critical" | null;
          last_computed_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          tier?: "unverified" | "basic" | "enhanced";
          verification_status?: "pending" | "verified" | "expired" | "rejected";
          tenure_months?: number;
          endorsement_count?: number;
          incident_flag?: boolean;
          incident_severity_max?: "low" | "medium" | "high" | "critical" | null;
          last_computed_at?: string;
        };
        Update: {
          tier?: "unverified" | "basic" | "enhanced";
          verification_status?: "pending" | "verified" | "expired" | "rejected";
          tenure_months?: number;
          endorsement_count?: number;
          incident_flag?: boolean;
          incident_severity_max?: "low" | "medium" | "high" | "critical" | null;
          last_computed_at?: string;
        };
        Relationships: [];
      };
      verifications: {
        Row: {
          id: string;
          worker_id: string;
          type: string;
          status: "pending" | "verified" | "expired" | "rejected";
          verified_at: string | null;
          expires_at: string | null;
          provider: string | null;
        };
        Insert: {
          id?: string;
          worker_id: string;
          type: string;
          status: "pending" | "verified" | "expired" | "rejected";
          verified_at?: string | null;
          expires_at?: string | null;
          provider?: string | null;
        };
        Update: {
          status?: "pending" | "verified" | "expired" | "rejected";
          verified_at?: string | null;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      incidents: {
        Row: {
          id: string;
          reporter_id: string;
          worker_id: string;
          type: "theft" | "misconduct" | "property_damage" | "harassment" | "safety_concern" | "other";
          severity: "low" | "medium" | "high" | "critical";
          status: "submitted" | "under_review" | "substantiated" | "unsubstantiated" | "inconclusive" | "appealed";
          description_encrypted: string;
          reported_at: string;
          reviewed_at: string | null;
          reviewer_id: string | null;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          worker_id: string;
          type: "theft" | "misconduct" | "property_damage" | "harassment" | "safety_concern" | "other";
          severity: "low" | "medium" | "high" | "critical";
          status?: "submitted" | "under_review" | "substantiated" | "unsubstantiated" | "inconclusive" | "appealed";
          description_encrypted: string;
          reported_at?: string;
          reviewed_at?: string | null;
          reviewer_id?: string | null;
        };
        Update: {
          status?: "submitted" | "under_review" | "substantiated" | "unsubstantiated" | "inconclusive" | "appealed";
          reviewed_at?: string | null;
          reviewer_id?: string | null;
        };
        Relationships: [];
      };
      incident_evidence: {
        Row: {
          id: string;
          incident_id: string;
          type: "photo" | "video" | "document" | "other";
          storage_path: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          incident_id: string;
          type: "photo" | "video" | "document" | "other";
          storage_path: string;
          uploaded_at?: string;
        };
        Update: {
          type?: "photo" | "video" | "document" | "other";
          storage_path?: string;
        };
        Relationships: [];
      };
      appeals: {
        Row: {
          id: string;
          incident_id: string;
          worker_id: string;
          reason: string;
          status: "pending" | "accepted" | "rejected";
          submitted_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          incident_id: string;
          worker_id: string;
          reason: string;
          status?: "pending" | "accepted" | "rejected";
          submitted_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          status?: "pending" | "accepted" | "rejected";
          reviewed_at?: string | null;
        };
        Relationships: [];
      };
      consent_grants: {
        Row: {
          id: string;
          worker_id: string;
          hirer_id: string;
          fields: string[];
          granted_at: string;
          expires_at: string;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          worker_id: string;
          hirer_id: string;
          fields: string[];
          granted_at?: string;
          expires_at: string;
          revoked_at?: string | null;
        };
        Update: {
          fields?: string[];
          expires_at?: string;
          revoked_at?: string | null;
        };
        Relationships: [];
      };
      endorsements: {
        Row: {
          id: string;
          worker_id: string;
          hirer_id: string;
          relationship: string;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          hirer_id: string;
          relationship: string;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          relationship?: string;
          comment?: string | null;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          metadata: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          metadata?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>; // Audit log is append-only
        Relationships: [];
      };
      consent_requests: {
        Row: {
          id: string;
          hirer_id: string;
          worker_id: string;
          fields: string[];
          message: string | null;
          status: "pending" | "approved" | "rejected" | "expired";
          requested_at: string;
          responded_at: string | null;
          consent_grant_id: string | null;
        };
        Insert: {
          id?: string;
          hirer_id: string;
          worker_id: string;
          fields: string[];
          message?: string | null;
          status?: "pending" | "approved" | "rejected" | "expired";
          requested_at?: string;
          responded_at?: string | null;
          consent_grant_id?: string | null;
        };
        Update: {
          status?: "pending" | "approved" | "rejected" | "expired";
          responded_at?: string | null;
          consent_grant_id?: string | null;
        };
        Relationships: [];
      };
      job_categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          icon: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          icon?: string | null;
          sort_order?: number;
        };
        Update: {
          slug?: string;
          name?: string;
          icon?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      agencies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          categories: string[];
          localities: string[];
          contact_phone: string | null;
          worker_count: number;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          categories?: string[];
          localities?: string[];
          contact_phone?: string | null;
          worker_count?: number;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          categories?: string[];
          localities?: string[];
          contact_phone?: string | null;
          worker_count?: number;
          verified_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      ratings: {
        Row: {
          id: string;
          worker_id: string;
          rater_id: string;
          score: number;
          comment: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          rater_id: string;
          score: number;
          comment?: string | null;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          score?: number;
          comment?: string | null;
          category?: string | null;
        };
        Relationships: [];
      };
      disclosure_requests: {
        Row: {
          id: string;
          requester_type: "law_enforcement" | "employer" | "regulator" | "other";
          requester_id: string;
          worker_id: string;
          legal_basis: string;
          status: "pending" | "approved" | "denied";
          documents: Array<{ name: string; storagePath: string }> | null;
          requested_at: string;
          processed_at: string | null;
          processor_id: string | null;
        };
        Insert: {
          id?: string;
          requester_type: "law_enforcement" | "employer" | "regulator" | "other";
          requester_id: string;
          worker_id: string;
          legal_basis: string;
          status?: "pending" | "approved" | "denied";
          documents?: Array<{ name: string; storagePath: string }> | null;
          requested_at?: string;
          processed_at?: string | null;
          processor_id?: string | null;
        };
        Update: {
          status?: "pending" | "approved" | "denied";
          processed_at?: string | null;
          processor_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/**
 * Create a typed Supabase client.
 */
export function createClient(supabaseUrl: string, supabaseKey: string) {
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey);
}

export type SupabaseClient = ReturnType<typeof createClient>;
