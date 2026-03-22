-- Migration: Add job categories, agencies, ratings, and new worker profile fields
-- Date: 2026-03-21

-- ============================================================================
-- JOB CATEGORIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS job_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10),
  sort_order INTEGER DEFAULT 0
);

-- ============================================================================
-- WORKER PROFILES — new columns
-- ============================================================================
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS locality VARCHAR(200);
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS availability VARCHAR(20) DEFAULT 'available';
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS agency_id UUID;

-- ============================================================================
-- AGENCIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  categories JSONB DEFAULT '[]',
  localities JSONB DEFAULT '[]',
  contact_phone VARCHAR(15),
  worker_count INTEGER DEFAULT 0,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RATINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES users(id) NOT NULL,
  rater_id UUID REFERENCES users(id) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  category VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SEED JOB CATEGORIES
-- ============================================================================
INSERT INTO job_categories (slug, name, icon, sort_order) VALUES
  ('maid', 'Maid / House Help', '🏠', 1),
  ('cook', 'Cook', '🍳', 2),
  ('driver', 'Driver', '🚗', 3),
  ('nanny', 'Nanny / Caregiver', '👶', 4),
  ('electrician', 'Electrician', '⚡', 5),
  ('plumber', 'Plumber', '🔧', 6),
  ('cleaner', 'Cleaner', '🧹', 7),
  ('security', 'Security Guard', '🛡️', 8),
  ('technician', 'AC / Appliance Tech', '❄️', 9),
  ('painter', 'Painter / Handyman', '🎨', 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_worker_profiles_category ON worker_profiles(category);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_locality ON worker_profiles(locality);
CREATE INDEX IF NOT EXISTS idx_worker_profiles_agency_id ON worker_profiles(agency_id);
CREATE INDEX IF NOT EXISTS idx_ratings_worker_id ON ratings(worker_id);
CREATE INDEX IF NOT EXISTS idx_agencies_user_id ON agencies(user_id);

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
