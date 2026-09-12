import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Auth
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

// Student
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/Dashboard';
import ReportProblemPage from './pages/student/ReportProblem';
import MyComplaintsPage from './pages/student/MyComplaints';
import ComplaintDetailPage from './pages/student/ComplaintDetail';
import MessFeedbackPage from './pages/student/MessFeedback';
import NotificationsPage from './pages/student/Notifications';
import ProfilePage from './pages/student/Profile';
import SettingsPage from './pages/student/Settings';
import StudentSafetyReportPage from './pages/student/StudentSafetyReport';
import MySafetyReportsPage from './pages/student/MySafetyReports';

// Admin
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import AdminSafetyPage from './pages/admin/AdminSafety';
import MessAnalytics from './pages/admin/MessAnalytics';
import AdminProfile from './pages/admin/AdminProfile';
import AdminSettings from './pages/admin/AdminSettings';
import AdminStudents from './pages/admin/AdminStudents';
import AdminStaff from './pages/admin/AdminStaff';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AnnouncementDetailPage from './pages/student/AnnouncementDetail';

// Legal & About
import AboutPage from './pages/legal/AboutPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsPage from './pages/legal/TermsPage';
import AccountDeletionPage from './pages/legal/AccountDeletionPage';

function needsOnboarding(user: any): boolean {
  return !!(user && user.role === 'student' && (!user.hostel || !user.room));
}

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'student' | 'admin' }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#070B1F' }}>
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <img
              src="/logo.png"
              alt="HostelHub Logo"
              className="w-16 h-16 object-contain animate-pulse"
            />
          </div>
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Loading HostelHub...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (needsOnboarding(user)) {
    return <Navigate to="/onboarding" replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#070B1F' }}>
        <div className="text-center">
          <img
            src="/logo.png"
            alt="HostelHub Logo"
            className="w-14 h-14 object-contain animate-pulse mx-auto mb-3"
          />
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/login" element={
        !user ? <LoginPage /> :
        needsOnboarding(user) ? <Navigate to="/onboarding" replace /> :
        <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
      } />

      <Route path="/onboarding" element={
        !user ? <Navigate to="/login" replace /> :
        !needsOnboarding(user) ? <Navigate to="/student" replace /> :
        <OnboardingPage />
      } />

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>
      }>
        <Route index element={<StudentDashboard />} />
        <Route path="report" element={<ReportProblemPage />} />
        <Route path="complaints" element={<MyComplaintsPage />} />
        <Route path="complaints/:id" element={<ComplaintDetailPage />} />
        <Route path="safety" element={<StudentSafetyReportPage />} />
        <Route path="safety-report" element={<StudentSafetyReportPage />} />
        <Route path="safety/my-reports" element={<MySafetyReportsPage />} />
        <Route path="my-safety-reports" element={<MySafetyReportsPage />} />
        <Route path="mess" element={<MessFeedbackPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="complaints" element={<ComplaintManagement />} />
        <Route path="safety" element={<AdminSafetyPage />} />
        <Route path="mess" element={<MessAnalytics />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Standalone Announcement Details Route */}
      <Route path="/announcements/:id" element={
        <ProtectedRoute><AnnouncementDetailPage /></ProtectedRoute>
      } />

      {/* Public About & Legal Routes (Google Play Console Ready) */}
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/terms-and-conditions" element={<Navigate to="/terms" replace />} />
      <Route path="/account-deletion" element={<AccountDeletionPage />} />
      <Route path="/data-deletion" element={<Navigate to="/account-deletion" replace />} />

      {/* Default redirect */}
      <Route path="/" element={
        !user ? <Navigate to="/login" replace /> :
        needsOnboarding(user) ? <Navigate to="/onboarding" replace /> :
        <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <NotificationProvider>
            <AppRoutes />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: '500' },
              }}
            />
          </NotificationProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
