import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppearanceSelector from '../../components/AppearanceSelector';
import NotificationSettingsCard from '../../components/NotificationSettingsCard';
import AboutLegalCard from '../../components/AboutLegalCard';
import toast from 'react-hot-toast';
import { LogOut, Settings } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully 👋');
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-xl lg:max-w-4xl mx-auto px-3.5 sm:px-4 pt-4 sm:pt-6 pb-24">

        {/* ── Settings Header ────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.2) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <Settings className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
              Settings
            </h1>
            <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Configure appearance themes, notification preferences, and session
            </p>
          </div>
        </div>

        {/* ── Appearance Selector (Theme System) ─────────────────────────── */}
        <div className="mb-4">
          <AppearanceSelector />
        </div>

        {/* ── Notification Preferences Card ──────────────────────────────── */}
        <div className="mb-4">
          <NotificationSettingsCard role="student" />
        </div>

        {/* ── About & Legal Section ──────────────────────────────────────── */}
        <div className="mb-4">
          <AboutLegalCard />
        </div>

        {/* ── Account Session Card ───────────────────────────────────────── */}
        <div
          className="rounded-2xl p-4 mb-4 border transition-all"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                }}
              >
                {user?.profile_photo ? (
                  <img src={user.profile_photo} alt="avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase() || 'S'
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate" style={{ color: 'var(--text-heading)' }}>
                  {user?.name || 'Student Account'}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                  {user?.email}
                </p>
              </div>
            </div>
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-500 shrink-0"
              style={{
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}
            >
              Student
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-rose-500 transition-all active:scale-95 flex items-center justify-center gap-2 border border-rose-500/25 hover:bg-rose-500/10 hover:border-rose-500/40"
            style={{ background: 'rgba(244, 63, 94, 0.08)' }}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* ── HostelHub Platform Branding ─────────────────────────────────── */}
        <div
          className="flex items-center justify-center gap-2 text-xs font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          <img src="/logo.png" alt="HostelHub" className="w-4 h-4 object-contain shrink-0" />
          <span>HostelHub &middot; Student Residence Portal</span>
        </div>

      </div>
    </div>
  );
}
