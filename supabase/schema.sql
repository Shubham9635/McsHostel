-- HostelHub Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- =============================================
-- PROFILES TABLE (replaces users)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  student_id TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin', 'super_admin')),
  room TEXT,
  hostel TEXT,
  block TEXT,
  profile_photo_url TEXT,
  phone TEXT,
  course TEXT,
  year TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);
CREATE INDEX IF NOT EXISTS profiles_student_id_idx ON profiles(student_id);

-- =============================================
-- STAFF TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  specialization TEXT,
  employee_id TEXT,
  department TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- COMPLAINTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_number TEXT NOT NULL UNIQUE,  -- e.g. HH-2026-00125
  student_id UUID NOT NULL REFERENCES profiles(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  room TEXT NOT NULL,
  hostel TEXT NOT NULL,
  location TEXT,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'medium', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved', 'rejected', 'reopened')),
  assigned_staff_id UUID REFERENCES staff(id),
  assigned_staff_name TEXT,
  assigned_by UUID REFERENCES profiles(id),
  resolved_by UUID REFERENCES profiles(id),
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS complaints_student_id_idx ON complaints(student_id);
CREATE INDEX IF NOT EXISTS complaints_status_idx ON complaints(status);
CREATE INDEX IF NOT EXISTS complaints_priority_idx ON complaints(priority);
CREATE INDEX IF NOT EXISTS complaints_category_idx ON complaints(category);
CREATE INDEX IF NOT EXISTS complaints_hostel_idx ON complaints(hostel);
CREATE INDEX IF NOT EXISTS complaints_created_at_idx ON complaints(created_at DESC);

-- =============================================
-- COMPLAINT STATUS HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS complaint_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  changed_by_name TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS status_history_complaint_idx ON complaint_status_history(complaint_id);

-- =============================================
-- COMPLAINT FEEDBACK TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS complaint_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id),
  solved BOOLEAN NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(complaint_id)  -- Only one feedback per complaint
);

-- =============================================
-- MESS REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS mess_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
  review_date DATE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, meal_type, review_date)  -- One review per student per meal per day
);

CREATE INDEX IF NOT EXISTS mess_reviews_date_idx ON mess_reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS mess_reviews_student_idx ON mess_reviews(student_id);
CREATE INDEX IF NOT EXISTS mess_reviews_meal_idx ON mess_reviews(meal_type);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('complaint', 'mess', 'announcement', 'info')),
  related_complaint_id UUID REFERENCES complaints(id),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications(created_at DESC);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_complaints_updated_at ON complaints;
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mess_reviews_updated_at ON mess_reviews;
CREATE TRIGGER update_mess_reviews_updated_at
  BEFORE UPDATE ON mess_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- EMAIL OTPS TABLE (for passwordless OTP login)
-- =============================================
CREATE TABLE IF NOT EXISTS email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_otps_email_idx ON email_otps(email);
CREATE INDEX IF NOT EXISTS email_otps_expires_at_idx ON email_otps(expires_at);

-- =============================================
-- SUPABASE STORAGE BUCKET
-- =============================================
-- Run this separately in Supabase SQL editor or Storage UI:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('complaint-photos', 'complaint-photos', true);

