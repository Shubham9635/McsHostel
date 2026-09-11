// ================================================================
// HOSTELHUB: DEMO DATA ISOLATION UTILITIES
// Ensures seeded dummy data is ONLY visible when logging in with
// demo accounts (student@hostel.hub & admin@hostel.hub).
// ================================================================

export const DEMO_EMAILS = [
  'student@hostel.hub',
  'admin@hostel.hub',
  'student@hostelhub.demo',
  'admin@hostelhub.demo',
];

export const DEMO_STUDENT_ID = '7ad33d82-5019-48e1-87f4-22ce03c18571'; // student@hostel.hub profile ID
export const SEED_STUDENT_ID = 'b1000000-0000-0000-0000-000000000001'; // Arjun Sharma profile ID

/**
 * Check if an email belongs to the demo accounts
 */
export function isDemoEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return DEMO_EMAILS.includes(normalized) || normalized.endsWith('@hostelhub.demo');
}

/**
 * Check if the active authenticated user is a demo account
 */
export function isDemoUser(user?: { email?: string } | null): boolean {
  return isDemoEmail(user?.email);
}

/**
 * Check if an ID belongs to the seeded dummy records (c1000000-..., b1000000-..., a1000000-...)
 */
export function isDummyId(id?: string | null): boolean {
  if (!id) return false;
  return id.startsWith('c1000000-') || id.startsWith('b1000000-') || id.startsWith('a1000000-');
}

/**
 * Check if a complaint is dummy/seeded
 */
export function isDummyComplaint(c: any): boolean {
  if (!c) return false;
  if (c.id && c.id.startsWith('c1000000-')) return true;
  if (c.student_id && (c.student_id.startsWith('b1000000-') || c.student_id === DEMO_STUDENT_ID)) return true;
  if (c.student_email && isDemoEmail(c.student_email)) return true;
  if (c.profiles?.email && isDemoEmail(c.profiles.email)) return true;
  return false;
}

/**
 * Check if a student profile is dummy/seeded
 */
export function isDummyStudent(profile: any): boolean {
  if (!profile) return false;
  if (profile.id && profile.id.startsWith('b1000000-')) return true;
  if (profile.email && isDemoEmail(profile.email)) return true;
  return false;
}

/**
 * Check if a staff member is dummy/seeded
 */
export function isDummyStaff(staff: any): boolean {
  if (!staff) return false;
  if (staff.id && staff.id.startsWith('a1000000-')) return true;
  if (staff.employee_id && ['EMP001', 'EMP002', 'EMP003', 'EMP004'].includes(staff.employee_id)) return true;
  return false;
}

/**
 * Check if a mess review is dummy/seeded
 */
export function isDummyMessReview(review: any): boolean {
  if (!review) return false;
  if (review.student_id && (review.student_id.startsWith('b1000000-') || review.student_id === DEMO_STUDENT_ID)) return true;
  if (review.profiles?.email && isDemoEmail(review.profiles.email)) return true;
  return false;
}
