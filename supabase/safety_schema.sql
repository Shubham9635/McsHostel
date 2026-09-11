-- ================================================================
-- HOSTELHUB: ANONYMOUS ANTI-RAGGING & SAFETY REPORTING SCHEMA
-- Run this in your Supabase SQL Editor
-- ================================================================

-- 1. Main table for safety / anti-ragging reports
CREATE TABLE IF NOT EXISTS safety_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id TEXT NOT NULL UNIQUE,          -- e.g. HR-2026-00421
  incident_type TEXT NOT NULL,                -- Ragging, Physical Harassment, Verbal Harassment, Bullying, Threat / Intimidation, Other Safety Concern
  severity TEXT NOT NULL DEFAULT 'Normal',    -- Normal, Serious, Urgent
  is_immediate_danger BOOLEAN DEFAULT false,
  description TEXT NOT NULL,
  hostel TEXT NOT NULL,
  block TEXT,
  floor TEXT,
  location TEXT,                              -- Specific location or room
  incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
  incident_time TIME NOT NULL DEFAULT CURRENT_TIME,
  status TEXT NOT NULL DEFAULT 'Submitted',   -- Submitted, Under Review, Investigation in Progress, Resolved, Closed
  priority TEXT NOT NULL DEFAULT 'Normal',    -- Normal, Medium, Urgent
  internal_notes TEXT,                        -- Admin-only internal investigation notes
  reporter_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Audit-only internal reference; NEVER returned to management UI
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Evidence table (private storage paths for photos and videos)
CREATE TABLE IF NOT EXISTS safety_report_evidence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES safety_reports(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,                 -- File path in 'safety-evidence' private bucket
  file_name TEXT,
  file_type TEXT NOT NULL,                    -- MIME type (e.g. image/jpeg, video/mp4)
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Audit log / status history timeline
CREATE TABLE IF NOT EXISTS safety_report_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES safety_reports(id) ON DELETE CASCADE,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by_name TEXT NOT NULL DEFAULT 'Hostel Management',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Indexes for high performance queries
CREATE INDEX IF NOT EXISTS idx_safety_reports_tracking ON safety_reports(tracking_id);
CREATE INDEX IF NOT EXISTS idx_safety_reports_status ON safety_reports(status);
CREATE INDEX IF NOT EXISTS idx_safety_reports_severity ON safety_reports(severity);
CREATE INDEX IF NOT EXISTS idx_safety_reports_created_at ON safety_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_safety_reports_reporter ON safety_reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_safety_evidence_report ON safety_report_evidence(report_id);
CREATE INDEX IF NOT EXISTS idx_safety_history_report ON safety_report_history(report_id);

-- 5. Row Level Security
ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_report_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_report_history ENABLE ROW LEVEL SECURITY;

-- Notice: Server uses Supabase service_role key to enforce strict privacy,
-- explicitly stripping reporter_user_id from all admin responses.
-- Student policies below allow direct authenticated client access if needed:

-- Students can insert their own reports
CREATE POLICY "Students insert own safety reports" ON safety_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);

-- Students can read only their own reports
CREATE POLICY "Students read own safety reports" ON safety_reports
  FOR SELECT USING (auth.uid() = reporter_user_id);

-- Admins can read all safety reports (reporter stripped server-side)
CREATE POLICY "Admins read safety reports" ON safety_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update status and notes
CREATE POLICY "Admins update safety reports" ON safety_reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Storage bucket note:
-- In Supabase Storage, create a private bucket named 'safety-evidence'
