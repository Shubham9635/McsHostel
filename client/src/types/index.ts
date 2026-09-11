export interface User {
  id: string;
  name: string;
  email: string;
  student_id: string | null;
  role: 'student' | 'admin';
  room: string | null;
  hostel: string | null;
  profile_photo: string | null;
  phone: string | null;
  course: string | null;
  year: string | null;
  created_at: string;
}

export const CATEGORIES = ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Wi-Fi/Internet', 'Other'] as const;
export const STATUSES = ['pending', 'assigned', 'in_progress', 'resolved'] as const;
export const PRIORITIES = ['normal', 'medium', 'urgent'] as const;

export interface Complaint {
  id: string;
  complaint_id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  category: string;
  title: string;
  description: string;
  photo_url: string | null;
  room: string;
  hostel: string;
  location: string | null;
  priority: 'normal' | 'medium' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'resolved';
  assigned_staff: string | null;
  assigned_staff_name: string | null;
  created_at: string;
  assigned_at: string | null;
  started_at: string | null;
  resolved_at: string | null;
  feedback?: ComplaintFeedback;
}

export interface ComplaintFeedback {
  id: string;
  complaint_id: string;
  student_id: string;
  solved: boolean;
  rating: number | null;
  comment: string | null;
  created_at: string;
}

export interface MessReview {
  id: string;
  student_id: string;
  student_name?: string;
  meal_type: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  date: string;
  rating: number;
  review: string | null;
  anonymous: boolean;
  created_at: string;
  is_own?: boolean;
}

export type AnnouncementCategory =
  | 'General'
  | 'Maintenance'
  | 'Mess'
  | 'Event'
  | 'Emergency'
  | 'Important'
  | 'Other';

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export type AnnouncementStatus = 'draft' | 'published' | 'scheduled' | 'expired' | 'archived';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  created_by?: string | null;
  created_by_name: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  attachment_size?: number | null;
  published_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
  read_count?: number;
  total_students?: number;
  has_read?: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  recipient_user_id?: string;
  title: string;
  message: string;
  type: string;
  related_type?: 'complaint' | 'safety_report' | 'mess' | 'announcement' | 'system';
  related_id?: string | null;
  priority?: 'normal' | 'important' | 'urgent';
  read: boolean;
  is_read?: boolean;
  created_at: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  specialization: string | null;
}

export interface AdminStats {
  total: number;
  pending: number;
  assigned?: number;
  in_progress: number;
  resolved: number;
  avg_resolution_days: number;
  today_mess_avg: number;
  today_mess_count: number;
  category_stats: { category: string; count: number }[];
  priority_stats: { urgent: number; medium: number; normal: number };
  staff: Staff[];
  total_students: number;
}

export interface MessAnalytics {
  overall_avg: number;
  total_reviews: number;
  meal_stats: { meal: string; count: number; avg_rating: number }[];
  daily_data: { date: string; avg: number; count: number }[];
  recent_reviews: MessReview[];
}
