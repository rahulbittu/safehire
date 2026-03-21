-- ============================================================================
-- Consent Requests — hirer-initiated access requests
-- ============================================================================
-- A hirer can request access to a worker's profile data.
-- The worker sees pending requests and can approve or reject.
-- Approval creates a consent_grant; rejection is recorded.
-- ============================================================================

CREATE TABLE IF NOT EXISTS consent_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hirer_id UUID NOT NULL REFERENCES users(id),
  worker_id UUID NOT NULL REFERENCES users(id),
  fields TEXT[] NOT NULL DEFAULT '{}',
  message TEXT,                              -- optional message from hirer
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  consent_grant_id UUID REFERENCES consent_grants(id)  -- linked grant if approved
);

-- Indexes for common queries
CREATE INDEX idx_consent_requests_worker ON consent_requests(worker_id, status);
CREATE INDEX idx_consent_requests_hirer ON consent_requests(hirer_id, status);

-- Enable RLS
ALTER TABLE consent_requests ENABLE ROW LEVEL SECURITY;

-- Workers can see requests addressed to them
CREATE POLICY "consent_requests_select_worker" ON consent_requests
  FOR SELECT USING (worker_id = auth.uid());

-- Hirers can see their own requests
CREATE POLICY "consent_requests_select_hirer" ON consent_requests
  FOR SELECT USING (hirer_id = auth.uid());

-- Hirers can create requests
CREATE POLICY "consent_requests_insert_hirer" ON consent_requests
  FOR INSERT WITH CHECK (hirer_id = auth.uid());

-- Workers can update (approve/reject) requests addressed to them
CREATE POLICY "consent_requests_update_worker" ON consent_requests
  FOR UPDATE USING (worker_id = auth.uid())
  WITH CHECK (worker_id = auth.uid());

-- Admins can read all
CREATE POLICY "consent_requests_select_admin" ON consent_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );
