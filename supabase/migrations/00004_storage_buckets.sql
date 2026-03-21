-- ============================================================================
-- Supabase Storage Buckets for Evidence Files
-- ============================================================================
-- NOTE: Supabase Storage bucket creation is done via the Supabase Dashboard
-- or the Management API, not via SQL migrations. This file documents the
-- expected bucket configuration and storage policies.
--
-- Run this via the Supabase Dashboard SQL editor or use the Supabase CLI.
-- ============================================================================

-- Create the incident-evidence bucket (private — no public access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'incident-evidence',
  'incident-evidence',
  false,   -- NOT public — all access through signed URLs
  10485760, -- 10 MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Storage RLS Policies
-- ============================================================================
-- Supabase Storage uses its own RLS policies on the storage.objects table.
-- These policies control who can upload, download, and delete files.

-- Reporters can upload evidence to their own incident folder
-- Path format: incident-evidence/{incident_id}/{filename}
CREATE POLICY "evidence_insert_reporter" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'incident-evidence'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id::text = (storage.foldername(name))[1]
      AND i.reporter_id = auth.uid()
    )
  );

-- Involved parties (reporter, worker) and admins can read evidence
CREATE POLICY "evidence_select_involved" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'incident-evidence'
    AND (
      EXISTS (
        SELECT 1 FROM public.incidents i
        WHERE i.id::text = (storage.foldername(name))[1]
        AND (i.reporter_id = auth.uid() OR i.worker_id = auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
      )
    )
  );

-- No delete policy — evidence is immutable once uploaded
-- Deletion requires service_role (admin action with audit trail)

-- ============================================================================
-- REMAINING GAPS:
-- 1. File encryption at rest: relies on Supabase/cloud provider encryption
-- 2. Virus scanning: not implemented
-- 3. File retention policy: not implemented
-- 4. Evidence chain of custody: metadata only, no hash verification
-- ============================================================================
