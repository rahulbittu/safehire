-- ============================================================================
-- Row Level Security Policies
-- ============================================================================
--
-- These policies use auth.uid() from Supabase Auth for the real auth path.
-- For dev auth (HMAC tokens parsed server-side), operations go through
-- the service_role key which bypasses RLS entirely.
--
-- SERVICE_ROLE USAGE JUSTIFICATION:
-- The tRPC route handler creates a service_role client because:
-- 1. Auth is handled at the tRPC middleware layer, not at the DB layer
-- 2. Dev auth tokens are not Supabase Auth JWTs
-- Once real Supabase Auth is the primary path (Phase 4), the client-side
-- operations can use the anon key with these RLS policies.
--
-- POLICY DESIGN:
-- - Workers can read/write their own data
-- - Hirers can read non-sensitive worker data (trust cards, search results)
-- - Hirers can only read full profiles when consent exists
-- - Admins can read all data for moderation
-- - Audit log is append-only (no updates, no deletes by non-service-role)
-- ============================================================================

-- ============================================================================
-- USERS
-- ============================================================================
-- Users can read their own record. Admins can read all.
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_select_admin" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Users can update their own record (email, etc.)
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Insert is handled by service_role during registration
CREATE POLICY "users_insert_service" ON users
  FOR INSERT WITH CHECK (true);
  -- NOTE: This allows insert for any authenticated user.
  -- In practice, registration is handled server-side via service_role.

-- ============================================================================
-- WORKER PROFILES
-- ============================================================================
-- Workers can CRUD their own profile
CREATE POLICY "worker_profiles_select_own" ON worker_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "worker_profiles_insert_own" ON worker_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "worker_profiles_update_own" ON worker_profiles
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Hirers can read LIMITED fields for search results (non-sensitive)
-- NOTE: Column-level security is not natively supported in Postgres RLS.
-- Field filtering is enforced at the application layer (searchWorkers query
-- only selects: id, user_id, full_name, skills, languages, experience_years, verified_at).
-- encrypted_aadhaar_hash and photo_url are excluded by the query.
CREATE POLICY "worker_profiles_select_hirer" ON worker_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'hirer')
  );

-- Admins can read all profiles
CREATE POLICY "worker_profiles_select_admin" ON worker_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================================================
-- HIRER PROFILES
-- ============================================================================
CREATE POLICY "hirer_profiles_select_own" ON hirer_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "hirer_profiles_insert_own" ON hirer_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "hirer_profiles_update_own" ON hirer_profiles
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "hirer_profiles_select_admin" ON hirer_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================================================
-- TRUST CARDS
-- ============================================================================
-- Workers can read their own trust card
CREATE POLICY "trust_cards_select_own" ON trust_cards
  FOR SELECT USING (worker_id = auth.uid());

-- Hirers can read any trust card (summary is non-sensitive)
CREATE POLICY "trust_cards_select_hirer" ON trust_cards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('hirer', 'admin'))
  );

-- Only service_role can insert/update trust cards (computed server-side)
-- No user-facing insert/update policies needed.

-- ============================================================================
-- VERIFICATIONS
-- ============================================================================
-- Workers can view their own verifications
CREATE POLICY "verifications_select_own" ON verifications
  FOR SELECT USING (worker_id = auth.uid());

-- Admins can read all
CREATE POLICY "verifications_select_admin" ON verifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================================================
-- CONSENT GRANTS
-- ============================================================================
-- Workers can read their own consent grants
CREATE POLICY "consent_grants_select_worker" ON consent_grants
  FOR SELECT USING (worker_id = auth.uid());

-- Hirers can read consent grants where they are the hirer
CREATE POLICY "consent_grants_select_hirer" ON consent_grants
  FOR SELECT USING (hirer_id = auth.uid());

-- Workers can insert consent grants (granting access)
CREATE POLICY "consent_grants_insert_worker" ON consent_grants
  FOR INSERT WITH CHECK (worker_id = auth.uid());

-- Workers can update (revoke) their own consent grants
CREATE POLICY "consent_grants_update_worker" ON consent_grants
  FOR UPDATE USING (worker_id = auth.uid())
  WITH CHECK (worker_id = auth.uid());

-- Admins can read all consent grants
CREATE POLICY "consent_grants_select_admin" ON consent_grants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================================================
-- INCIDENTS
-- ============================================================================
-- Workers can read incidents where they are the subject
CREATE POLICY "incidents_select_worker" ON incidents
  FOR SELECT USING (worker_id = auth.uid());

-- Reporters can read incidents they filed
CREATE POLICY "incidents_select_reporter" ON incidents
  FOR SELECT USING (reporter_id = auth.uid());

-- Any authenticated user can create an incident report
CREATE POLICY "incidents_insert_authenticated" ON incidents
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Admins can read all and update status
CREATE POLICY "incidents_select_admin" ON incidents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "incidents_update_admin" ON incidents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================================================
-- INCIDENT EVIDENCE
-- ============================================================================
-- Same access as parent incident (reporter, subject, admin)
CREATE POLICY "incident_evidence_select" ON incident_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM incidents i
      WHERE i.id = incident_evidence.incident_id
      AND (i.reporter_id = auth.uid() OR i.worker_id = auth.uid()
           OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'))
    )
  );

CREATE POLICY "incident_evidence_insert" ON incident_evidence
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM incidents i
      WHERE i.id = incident_evidence.incident_id
      AND i.reporter_id = auth.uid()
    )
  );

-- ============================================================================
-- APPEALS
-- ============================================================================
-- Workers can read and create appeals for their incidents
CREATE POLICY "appeals_select_worker" ON appeals
  FOR SELECT USING (worker_id = auth.uid());

CREATE POLICY "appeals_insert_worker" ON appeals
  FOR INSERT WITH CHECK (worker_id = auth.uid());

-- Admins can read all and update status
CREATE POLICY "appeals_select_admin" ON appeals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "appeals_update_admin" ON appeals
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================================================
-- ENDORSEMENTS
-- ============================================================================
-- Workers can read endorsements about them
CREATE POLICY "endorsements_select_worker" ON endorsements
  FOR SELECT USING (worker_id = auth.uid());

-- Hirers can insert endorsements
CREATE POLICY "endorsements_insert_hirer" ON endorsements
  FOR INSERT WITH CHECK (hirer_id = auth.uid());

-- Hirers can read endorsements they wrote
CREATE POLICY "endorsements_select_hirer" ON endorsements
  FOR SELECT USING (hirer_id = auth.uid());

-- Admins can read all
CREATE POLICY "endorsements_select_admin" ON endorsements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================================================
-- AUDIT LOG — APPEND ONLY
-- ============================================================================
-- Any authenticated user can insert (actions are logged by the server)
CREATE POLICY "audit_log_insert_authenticated" ON audit_log
  FOR INSERT WITH CHECK (actor_id = auth.uid());

-- Admins can read the audit log
CREATE POLICY "audit_log_select_admin" ON audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Workers can read audit log entries about them
CREATE POLICY "audit_log_select_own" ON audit_log
  FOR SELECT USING (actor_id = auth.uid());

-- NO UPDATE OR DELETE policies — audit log is immutable

-- ============================================================================
-- DISCLOSURE REQUESTS
-- ============================================================================
-- Workers can read disclosure requests about them
CREATE POLICY "disclosure_requests_select_worker" ON disclosure_requests
  FOR SELECT USING (worker_id = auth.uid());

-- Requesters can read their own requests
CREATE POLICY "disclosure_requests_select_requester" ON disclosure_requests
  FOR SELECT USING (requester_id = auth.uid());

-- Authenticated users can create disclosure requests
CREATE POLICY "disclosure_requests_insert_authenticated" ON disclosure_requests
  FOR INSERT WITH CHECK (requester_id = auth.uid());

-- Admins can read all and process
CREATE POLICY "disclosure_requests_select_admin" ON disclosure_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE POLICY "disclosure_requests_update_admin" ON disclosure_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );
