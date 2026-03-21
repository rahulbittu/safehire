-- ============================================================================
-- ROW LEVEL SECURITY POLICIES for SafeHire
-- ============================================================================
-- Convention: auth.uid() returns the current user's UUID from Supabase Auth.
-- Helper to get user role:
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS VARCHAR AS $$
  SELECT role FROM users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- USERS
-- ============================================================================
-- Users can read their own record
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own record (limited fields handled in app layer)
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY users_admin_select ON users
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================================
-- WORKER PROFILES
-- ============================================================================
-- Workers can read and update their own profile
CREATE POLICY worker_profiles_select_own ON worker_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY worker_profiles_update_own ON worker_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY worker_profiles_insert_own ON worker_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Hirers can search workers (limited fields enforced at query level)
-- This policy allows SELECT but the application layer restricts which columns are returned.
CREATE POLICY worker_profiles_hirer_search ON worker_profiles
  FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('hirer', 'admin')
  );

-- ============================================================================
-- HIRER PROFILES
-- ============================================================================
CREATE POLICY hirer_profiles_select_own ON hirer_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY hirer_profiles_update_own ON hirer_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY hirer_profiles_insert_own ON hirer_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can read all hirer profiles
CREATE POLICY hirer_profiles_admin_select ON hirer_profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================================
-- TRUST CARDS
-- ============================================================================
-- Trust cards are readable by any authenticated user
-- (detailed data gating is handled by consent checks in the application layer)
CREATE POLICY trust_cards_select_authenticated ON trust_cards
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only the system (service role) can insert/update trust cards
-- Workers and hirers cannot directly modify trust cards.

-- ============================================================================
-- VERIFICATIONS
-- ============================================================================
-- Workers can see their own verifications
CREATE POLICY verifications_select_own ON verifications
  FOR SELECT USING (worker_id = auth.uid());

-- Admins can see all verifications
CREATE POLICY verifications_admin_select ON verifications
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================================
-- INCIDENTS
-- ============================================================================
-- Reporter can read their own reports
CREATE POLICY incidents_reporter_select ON incidents
  FOR SELECT USING (reporter_id = auth.uid());

-- Worker can read incidents about them
CREATE POLICY incidents_worker_select ON incidents
  FOR SELECT USING (worker_id = auth.uid());

-- Admins can read all incidents
CREATE POLICY incidents_admin_select ON incidents
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- Authenticated users can insert incidents (report)
CREATE POLICY incidents_insert_authenticated ON incidents
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND reporter_id = auth.uid());

-- Only admins can update incidents (review)
CREATE POLICY incidents_admin_update ON incidents
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================================
-- INCIDENT EVIDENCE
-- ============================================================================
-- Same access as the parent incident
CREATE POLICY incident_evidence_select ON incident_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM incidents
      WHERE incidents.id = incident_evidence.incident_id
      AND (incidents.reporter_id = auth.uid()
           OR incidents.worker_id = auth.uid()
           OR public.get_user_role(auth.uid()) = 'admin')
    )
  );

CREATE POLICY incident_evidence_insert ON incident_evidence
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM incidents
      WHERE incidents.id = incident_evidence.incident_id
      AND incidents.reporter_id = auth.uid()
    )
  );

-- ============================================================================
-- APPEALS
-- ============================================================================
-- Worker can read and insert their own appeals
CREATE POLICY appeals_worker_select ON appeals
  FOR SELECT USING (worker_id = auth.uid());

CREATE POLICY appeals_worker_insert ON appeals
  FOR INSERT WITH CHECK (worker_id = auth.uid());

-- Admins can read and update all appeals
CREATE POLICY appeals_admin_select ON appeals
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY appeals_admin_update ON appeals
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- ============================================================================
-- CONSENT GRANTS
-- ============================================================================
-- Workers can read and manage their own consent grants
CREATE POLICY consent_grants_worker_select ON consent_grants
  FOR SELECT USING (worker_id = auth.uid());

CREATE POLICY consent_grants_worker_insert ON consent_grants
  FOR INSERT WITH CHECK (worker_id = auth.uid());

CREATE POLICY consent_grants_worker_update ON consent_grants
  FOR UPDATE USING (worker_id = auth.uid());

-- Hirers can read consent grants issued to them
CREATE POLICY consent_grants_hirer_select ON consent_grants
  FOR SELECT USING (hirer_id = auth.uid());

-- ============================================================================
-- ENDORSEMENTS
-- ============================================================================
-- Workers can read endorsements about them
CREATE POLICY endorsements_worker_select ON endorsements
  FOR SELECT USING (worker_id = auth.uid());

-- Hirers can insert endorsements and read their own
CREATE POLICY endorsements_hirer_insert ON endorsements
  FOR INSERT WITH CHECK (hirer_id = auth.uid());

CREATE POLICY endorsements_hirer_select ON endorsements
  FOR SELECT USING (hirer_id = auth.uid());

-- ============================================================================
-- AUDIT LOG
-- ============================================================================
-- Only admins can read the audit log
CREATE POLICY audit_log_admin_select ON audit_log
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

-- Inserts are done via service role (server-side) only

-- ============================================================================
-- DISCLOSURE REQUESTS
-- ============================================================================
-- Workers can see disclosure requests about them
CREATE POLICY disclosure_requests_worker_select ON disclosure_requests
  FOR SELECT USING (worker_id = auth.uid());

-- Requesters can see their own requests
CREATE POLICY disclosure_requests_requester_select ON disclosure_requests
  FOR SELECT USING (requester_id = auth.uid());

-- Admins can read and update all disclosure requests
CREATE POLICY disclosure_requests_admin_select ON disclosure_requests
  FOR SELECT USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY disclosure_requests_admin_update ON disclosure_requests
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');
