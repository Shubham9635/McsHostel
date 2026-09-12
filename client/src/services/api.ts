import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 25000,
});

// Auto-attach JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('hh_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hh_token');
      localStorage.removeItem('hh_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  directLogin: (email: string) => api.post('/auth/direct-login', { email }),
  sendOtp: (email: string) => api.post('/auth/send-otp', { email }),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
  me: () => api.get('/auth/me'),
  register: (data: object) => api.post('/auth/register', data),
  updateProfile: (data: object) => api.patch('/auth/profile', data),
  changePassword: (data: object) => api.post('/auth/change-password', data),
};

// Complaints
export const complaintsApi = {
  getAll: (params?: object) => api.get('/complaints', { params }),
  getById: (id: string) => api.get(`/complaints/${id}`),
  getHistory: (id: string) => api.get(`/complaints/${id}/history`),
  create: (data: object) => api.post('/complaints', data),
  updateStatus: (id: string, data: object) => api.patch(`/complaints/${id}/status`, data),
  submitFeedback: (id: string, data: object) => api.post(`/complaints/${id}/feedback`, data),
};

// Mess
export const messApi = {
  getReviews: (params?: object) => api.get('/mess/reviews', { params }),
  getToday: () => api.get('/mess/today'),
  submitReview: (data: object) => api.post('/mess/reviews', data),
  getAnalytics: () => api.get('/mess/analytics'),
};

// Notifications
export const notificationsApi = {
  getAll: (params?: { type?: string; unread_only?: boolean; page?: number; limit?: number }) =>
    api.get('/notifications', { params }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  getSettings: () => api.get('/notifications/settings'),
  updateSettings: (data: object) => api.patch('/notifications/settings', data),
};

// Admin
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getStudents: () => api.get('/admin/students'),
  getStaff: () => api.get('/admin/staff'),
  addStaff: (data: object) => api.post('/admin/staff', data),
  deleteStaff: (id: string) => api.delete(`/admin/staff/${id}`),
  assignStaff: (complaintId: string, data: object) => api.patch(`/admin/complaints/${complaintId}/assign`, data),
};

// Upload
export const uploadApi = {
  uploadPhoto: (formData: FormData) => api.post('/upload/complaint-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  // New endpoint for safety evidence upload
  uploadSafetyEvidence: (reportId: string, formData: FormData) => api.post(`/safety/upload/${reportId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Safety reporting API
export const safetyApi = {
  // Student submit a new report
  submitReport: (data: object) => api.post('/safety/reports', data),
  // Student fetch own reports
  fetchMyReports: () => api.get('/safety/reports/my'),
  // Student fetch single report status and timeline
  fetchReportStatus: (id: string) => api.get(`/safety/reports/${id}/status`),
  // Admin fetch live stats
  fetchStats: () => api.get('/safety/admin/stats'),
  // Admin fetch all reports (with optional filters)
  fetchAll: (params?: object) => api.get('/safety/admin/reports', { params }),
  // Admin fetch single report detail
  fetchReport: (id: string) => api.get(`/safety/admin/reports/${id}`),
  // Admin update status
  updateStatus: (id: string, data: object) => api.patch(`/safety/admin/reports/${id}/status`, data),
  // Fetch signed URLs for evidence (admin)
  fetchEvidenceUrls: (id: string) => api.get(`/safety/admin/reports/${id}/evidence`),
};

// Announcements API
export const announcementsApi = {
  getAll: (params?: { status?: string; category?: string; priority?: string; search?: string }) =>
    api.get('/announcements', { params }),
  getById: (id: string) => api.get(`/announcements/${id}`),
  create: (data: object) => api.post('/announcements', data),
  update: (id: string, data: object) => api.patch(`/announcements/${id}`, data),
  publish: (id: string) => api.post(`/announcements/${id}/publish`),
  delete: (id: string) => api.delete(`/announcements/${id}`),
  getStats: () => api.get('/announcements/stats'),
  uploadAttachment: (formData: FormData) =>
    api.post('/announcements/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

