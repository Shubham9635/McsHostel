// Re-export supabase client for convenience
// The old JsonDB class has been replaced by Supabase PostgreSQL
export { supabase as default, supabase } from './supabase';

// Type helpers — keep compatible with existing route code
export type ProfileRow = {
  id: string;
  name: string;
  email: string;
  student_id: string | null;
  password_hash: string;
  role: 'student' | 'staff' | 'admin' | 'super_admin';
  room: string | null;
  hostel: string | null;
  block: string | null;
  profile_photo_url: string | null;
  phone: string | null;
  course: string | null;
  year: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ComplaintRow = {
  id: string;
  complaint_number: string;
  student_id: string;
  category: string;
  title: string;
  description: string;
  photo_url: string | null;
  room: string;
  hostel: string;
  location: string | null;
  priority: 'normal' | 'medium' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'rejected' | 'reopened';
  assigned_staff_id: string | null;
  assigned_staff_name: string | null;
  assigned_by: string | null;
  resolved_by: string | null;
  resolution_note: string | null;
  created_at: string;
  assigned_at: string | null;
  started_at: string | null;
  resolved_at: string | null;
  updated_at: string;
};

export type StatusHistoryRow = {
  id: string;
  complaint_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  changed_by_name: string | null;
  note: string | null;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'complaint' | 'mess' | 'announcement' | 'info';
  related_complaint_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type MessReviewRow = {
  id: string;
  student_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  review_date: string;
  rating: number;
  review_text: string | null;
  anonymous: boolean;
  created_at: string;
  updated_at: string;
};

export type StaffRow = {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  specialization: string | null;
  employee_id: string | null;
  department: string | null;
  is_active: boolean;
  created_at: string;
};

export type ComplaintFeedbackRow = {
  id: string;
  complaint_id: string;
  student_id: string;
  solved: boolean;
  rating: number | null;
  comment: string | null;
  created_at: string;
};
