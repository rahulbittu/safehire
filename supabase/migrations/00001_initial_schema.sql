-- SafeHire: Initial Schema Migration
-- Creates all core tables for the privacy-first worker trust platform.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS
-- ============================================================================
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone       VARCHAR(15) NOT NULL UNIQUE,
  email       VARCHAR(255),
  role        VARCHAR(20) NOT NULL CHECK (role IN ('worker', 'hirer', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users (phone);
CREATE INDEX idx_users_role ON users (role);

-- ============================================================================
-- WORKER PROFILES
-- ============================================================================
CREATE TABLE worker_profiles (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name               VARCHAR(200) NOT NULL,
  encrypted_aadhaar_hash  VARCHAR(500),  -- One-way hash, NEVER raw Aadhaar
  photo_url               TEXT,
  skills                  JSONB NOT NULL DEFAULT '[]'::JSONB,
  languages               JSONB NOT NULL DEFAULT '[]'::JSONB,
  experience_years        INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
  verified_at             TIMESTAMPTZ
);

CREATE INDEX idx_worker_profiles_user_id ON worker_profiles (user_id);
CREATE INDEX idx_worker_profiles_skills ON worker_profiles USING GIN (skills);

-- ============================================================================
-- HIRER PROFILES
-- ============================================================================
CREATE TABLE hirer_profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  organization  VARCHAR(300) NOT NULL,
  type          VARCHAR(20) NOT NULL CHECK (type IN ('individual', 'business', 'agency'))
);

CREATE INDEX idx_hirer_profiles_user_id ON hirer_profiles (user_id);

-- ============================================================================
-- TRUST CARDS
-- ============================================================================
CREATE TABLE trust_cards (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  tier                  VARCHAR(20) NOT NULL DEFAULT 'unverified'
                        CHECK (tier IN ('unverified', 'basic', 'enhanced')),
  verification_status   VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (verification_status IN ('pending', 'verified', 'expired', 'rejected')),
  tenure_months         INTEGER NOT NULL DEFAULT 0 CHECK (tenure_months >= 0),
  endorsement_count     INTEGER NOT NULL DEFAULT 0 CHECK (endorsement_count >= 0),
  incident_flag         BOOLEAN NOT NULL DEFAULT FALSE,
  incident_severity_max VARCHAR(20) CHECK (incident_severity_max IN ('low', 'medium', 'high', 'critical')),
  last_computed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trust_cards_worker_id ON trust_cards (worker_id);

-- ============================================================================
-- VERIFICATIONS
-- ============================================================================
CREATE TABLE verifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(50) NOT NULL,  -- e.g., 'phone', 'aadhaar', 'digilocker'
  status      VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'verified', 'expired', 'rejected')),
  verified_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  provider    VARCHAR(100)  -- e.g., 'digilocker', 'msg91'
);

CREATE INDEX idx_verifications_worker_id ON verifications (worker_id);
CREATE INDEX idx_verifications_status ON verifications (status);

-- ============================================================================
-- INCIDENTS
-- ============================================================================
CREATE TABLE incidents (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id             UUID NOT NULL REFERENCES users(id),
  worker_id               UUID NOT NULL REFERENCES users(id),
  type                    VARCHAR(30) NOT NULL
                          CHECK (type IN ('theft', 'misconduct', 'property_damage', 'harassment', 'safety_concern', 'other')),
  severity                VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status                  VARCHAR(20) NOT NULL DEFAULT 'submitted'
                          CHECK (status IN ('submitted', 'under_review', 'substantiated', 'unsubstantiated', 'inconclusive', 'appealed')),
  description_encrypted   TEXT NOT NULL,  -- Encrypted, never plaintext
  reported_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at             TIMESTAMPTZ,
  reviewer_id             UUID REFERENCES users(id)
);

CREATE INDEX idx_incidents_worker_id ON incidents (worker_id);
CREATE INDEX idx_incidents_reporter_id ON incidents (reporter_id);
CREATE INDEX idx_incidents_status ON incidents (status);

-- ============================================================================
-- INCIDENT EVIDENCE
-- ============================================================================
CREATE TABLE incident_evidence (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id   UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  type          VARCHAR(20) NOT NULL CHECK (type IN ('photo', 'video', 'document', 'other')),
  storage_path  TEXT NOT NULL,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incident_evidence_incident_id ON incident_evidence (incident_id);

-- ============================================================================
-- APPEALS
-- ============================================================================
CREATE TABLE appeals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id   UUID NOT NULL REFERENCES incidents(id),
  worker_id     UUID NOT NULL REFERENCES users(id),
  reason        TEXT NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'accepted', 'rejected')),
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at   TIMESTAMPTZ
);

CREATE INDEX idx_appeals_incident_id ON appeals (incident_id);
CREATE INDEX idx_appeals_worker_id ON appeals (worker_id);
CREATE INDEX idx_appeals_status ON appeals (status);

-- ============================================================================
-- CONSENT GRANTS
-- ============================================================================
CREATE TABLE consent_grants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id   UUID NOT NULL REFERENCES users(id),
  hirer_id    UUID NOT NULL REFERENCES users(id),
  fields      JSONB NOT NULL,  -- Array of field names the worker has consented to share
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ
);

CREATE INDEX idx_consent_grants_worker_id ON consent_grants (worker_id);
CREATE INDEX idx_consent_grants_hirer_id ON consent_grants (hirer_id);
CREATE INDEX idx_consent_grants_active ON consent_grants (worker_id, hirer_id)
  WHERE revoked_at IS NULL;

-- ============================================================================
-- ENDORSEMENTS
-- ============================================================================
CREATE TABLE endorsements (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id     UUID NOT NULL REFERENCES users(id),
  hirer_id      UUID NOT NULL REFERENCES users(id),
  relationship  VARCHAR(200) NOT NULL,
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_endorsements_worker_id ON endorsements (worker_id);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================
CREATE TABLE audit_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id      UUID NOT NULL REFERENCES users(id),
  action        VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id   VARCHAR(255) NOT NULL,
  metadata      JSONB,
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_actor_id ON audit_log (actor_id);
CREATE INDEX idx_audit_log_action ON audit_log (action);
CREATE INDEX idx_audit_log_resource ON audit_log (resource_type, resource_id);
CREATE INDEX idx_audit_log_created_at ON audit_log (created_at DESC);

-- ============================================================================
-- DISCLOSURE REQUESTS
-- ============================================================================
CREATE TABLE disclosure_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_type  VARCHAR(30) NOT NULL
                  CHECK (requester_type IN ('law_enforcement', 'employer', 'regulator', 'other')),
  requester_id    UUID NOT NULL REFERENCES users(id),
  worker_id       UUID NOT NULL REFERENCES users(id),
  legal_basis     TEXT NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'denied')),
  documents       JSONB,  -- Array of { name, storagePath }
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at    TIMESTAMPTZ,
  processor_id    UUID REFERENCES users(id)
);

CREATE INDEX idx_disclosure_requests_worker_id ON disclosure_requests (worker_id);
CREATE INDEX idx_disclosure_requests_status ON disclosure_requests (status);

-- ============================================================================
-- UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hirer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE disclosure_requests ENABLE ROW LEVEL SECURITY;
