-- HostelHub Row Level Security Policies
-- Run AFTER schema.sql in Supabase SQL Editor

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE mess_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- =============================================
-- NOTE: These policies are for FUTURE direct Supabase
-- client access. Currently the Express server uses the
-- service_role key which bypasses RLS.
-- =============================================

-- Profiles: users can read their own
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = id::text);

-- Profiles: users can update allowed fields only (enforced in app layer)
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Complaints: students see only their own
CREATE POLICY "Students see own complaints" ON complaints
  FOR SELECT USING (auth.uid()::text = student_id::text);

-- Complaints: students can insert own complaints
CREATE POLICY "Students create own complaints" ON complaints
  FOR INSERT WITH CHECK (auth.uid()::text = student_id::text);

-- Status history: students see history for their complaints
CREATE POLICY "Students see own complaint history" ON complaint_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM complaints c WHERE c.id = complaint_id AND c.student_id::text = auth.uid()::text
    )
  );

-- Feedback: students see and create their own
CREATE POLICY "Students see own feedback" ON complaint_feedback
  FOR SELECT USING (auth.uid()::text = student_id::text);

CREATE POLICY "Students create own feedback" ON complaint_feedback
  FOR INSERT WITH CHECK (auth.uid()::text = student_id::text);

-- Mess reviews: students see all reviews, create/update only their own
CREATE POLICY "Students see all mess reviews" ON mess_reviews
  FOR SELECT USING (true);

CREATE POLICY "Students create own mess reviews" ON mess_reviews
  FOR INSERT WITH CHECK (auth.uid()::text = student_id::text);

CREATE POLICY "Students update own mess reviews" ON mess_reviews
  FOR UPDATE USING (auth.uid()::text = student_id::text);

-- Notifications: users see only their own
CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Staff: only admins can manage staff
CREATE POLICY "Admins manage staff" ON staff
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id::text = auth.uid()::text AND role IN ('admin', 'super_admin'))
  );

-- Staff: anyone authenticated can read staff
CREATE POLICY "Authenticated read staff" ON staff
  FOR SELECT USING (auth.role() = 'authenticated');
