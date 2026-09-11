import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppearanceSelector from '../../components/AppearanceSelector';
import NotificationSettingsCard from '../../components/NotificationSettingsCard';
import AboutLegalCard from '../../components/AboutLegalCard';
import toast from 'react-hot-toast';
import { Settings, Shield, LogOut } from 'lucide-react';

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully 👋');
    navigate('/login');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ color: 'var(--text-heading)' }}
          >
            System Settings
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Configure display theme, real-time alert preferences, and developer support
          </p>
        </div>
      </div>

      {/* Theme / Appearance Section */}
      <AppearanceSelector />

      {/* Notification Preferences Section */}
      <NotificationSettingsCard role="admin" />

      {/* About & Legal Section */}
      <AboutLegalCard />

      {/* Active Session & Logout Card */}
      <div
        className="rounded-2xl p-4 sm:p-5 border transition-all"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: 'var(--text-heading)' }}>
                {user?.name === 'HostelHub Administrator' || !user?.name ? 'Hostel Management' : user.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                {user?.email || 'admin@hostel.hub'}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            <Shield className="w-3 h-3" /> Full Root Access
          </span>
        </div>

        <button
          id="admin-settings-logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 hover:text-red-400 font-bold text-xs sm:text-sm transition-all active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Administrator Session</span>
        </button>
      </div>

      {/* Platform Branding */}
      <div
        className="flex items-center justify-center gap-2 text-xs font-medium pt-1"
        style={{ color: 'var(--text-muted)' }}
      >
        <img src="/logo.png" alt="HostelHub" className="w-4 h-4 object-contain shrink-0" />
        <span>HostelHub &middot; Admin Management Portal</span>
      </div>
    </div>
  );
}
