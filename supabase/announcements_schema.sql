-- ================================================================
-- HOSTELHUB: ANNOUNCEMENTS & BROADCAST NOTICES SCHEMA
-- Run this in your Supabase SQL Editor
-- ================================================================

-- 1. Main table for announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General' CHECK (category IN ('General', 'Maintenance', 'Mess', 'Event', 'Emergency', 'Important', 'Other')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'expired', 'archived')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by_name TEXT NOT NULL DEFAULT 'Hostel Management',
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  attachment_size BIGINT,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Announcement student read analytics tracking table
CREATE TABLE IF NOT EXISTS announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(announcement_id, student_id)
);

-- 3. Performance indexes
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_published_at ON announcements(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON announcements(expires_at);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement ON announcement_reads(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_student ON announcement_reads(student_id);

-- 4. Enable Supabase Realtime for announcements table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'announcements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    NULL; -- Publication might not exist in standalone postgres
END $$;

-- 5. Updated_at Trigger for announcements
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Row Level Security (RLS)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

-- Students: can read published, active announcements
CREATE POLICY "Students can read published announcements" ON announcements
  FOR SELECT USING (
    status = 'published' AND (expires_at IS NULL OR expires_at > now())
  );

-- Admins: can read, create, update, and delete all announcements
CREATE POLICY "Admins full access to announcements" ON announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Students: can insert and read their own announcement read status
CREATE POLICY "Students can record own read status" ON announcement_reads
  FOR INSERT WITH CHECK (
    auth.uid() = student_id
  );

CREATE POLICY "Students can read own read status" ON announcement_reads
  FOR SELECT USING (
    auth.uid() = student_id
  );

-- Admins: can read all read tracking records for analytics
CREATE POLICY "Admins read all announcement reads" ON announcement_reads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
