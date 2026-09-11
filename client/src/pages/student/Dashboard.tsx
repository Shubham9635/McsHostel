import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDropdown from '../../components/NotificationDropdown';
import { complaintsApi, messApi } from '../../services/api';
import type { Complaint } from '../../types';
import {
  Bell,
  Building2,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  Star,
  Wrench,
  UtensilsCrossed,
  ClipboardList,
  Home,
  ArrowRight,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending:     { label: 'Open',        bg: 'bg-orange-500/15', text: 'text-orange-400',  dot: 'bg-orange-400' },
  assigned:    { label: 'Assigned',    bg: 'bg-blue-500/15',   text: 'text-blue-400',    dot: 'bg-blue-400'   },
  in_progress: { label: 'In Progress', bg: 'bg-purple-500/15', text: 'text-purple-400',  dot: 'bg-purple-400' },
  resolved:    { label: 'Resolved',    bg: 'bg-emerald-500/15',text: 'text-emerald-400', dot: 'bg-emerald-400' },
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.6s infinite',
      }}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [todayMessAvg, setTodayMessAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      complaintsApi.getAll(),
      messApi.getToday(),
    ])
      .then(([cRes, mRes]) => {
        setComplaints(cRes.data);
        const allAvgs = mRes.data.meals
          .filter((m: any) => m.avg_rating)
          .map((m: any) => m.avg_rating);
        if (allAvgs.length > 0) {
          setTodayMessAvg(
            allAvgs.reduce((a: number, b: number) => a + b, 0) / allAvgs.length,
          );
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const stats = {
    open:       complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'assigned' || c.status === 'in_progress').length,
    resolved:   complaints.filter(c => c.status === 'resolved').length,
  };

  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  const firstName = user?.name?.split(' ')[0] ?? 'Student';
  const initial   = firstName.charAt(0).toUpperCase();

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-3.5 sm:px-4 pt-3 sm:pt-4 pb-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        {/* Hero skeleton */}
        <Skeleton className="h-28 w-full mb-4 rounded-2xl" />
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
        {/* Quick actions skeleton */}
        <Skeleton className="h-4 w-28 mb-2" />
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
        </div>
        {/* Recent skeleton */}
        <Skeleton className="h-4 w-32 mb-2" />
        {[1, 2].map(i => <Skeleton key={i} className="h-14 mb-2 rounded-xl" />)}
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <h2 className="text-white font-bold text-base mb-1">Unable to load dashboard</h2>
        <p className="text-slate-400 text-xs text-center mb-4">
          Something went wrong. Please check your connection and try again.
        </p>
        <button
          onClick={loadData}
          className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Full dashboard ────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-up { animation: fadeUp 0.3s ease both; }
        .anim-delay-1 { animation-delay: 0.04s; }
        .anim-delay-2 { animation-delay: 0.08s; }
        .anim-delay-3 { animation-delay: 0.12s; }
        .anim-delay-4 { animation-delay: 0.16s; }
      `}</style>

      <div className="max-w-lg mx-auto px-3.5 sm:px-4 pt-3 sm:pt-4 pb-8">

        {/* ── App Header ──────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-3.5 anim-fade-up">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="HostelHub Logo"
              className="w-9 h-9 object-contain drop-shadow-[0_2px_10px_rgba(99,102,241,0.4)] shrink-0"
            />
            <div className="leading-none">
              <p className="text-sm sm:text-base font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
                Hostel<span style={{ color: '#f97316' }}>Hub</span>
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium mt-0.5">Student Residence Portal</p>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1.5">
            {/* Notification bell */}
            <div className="relative">
              <button
                id="header-notif-btn"
                onClick={() => {
                  if (window.innerWidth < 640) {
                    navigate('/student/notifications');
                  } else {
                    setNotifDropdownOpen(prev => !prev);
                  }
                }}
                className="relative w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-input)' }}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ fontSize: 7, background: '#ef4444' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={notifDropdownOpen}
                onClose={() => setNotifDropdownOpen(false)}
                viewAllPath="/student/notifications"
              />
            </div>

            {/* Profile avatar */}
            <button
              id="header-profile-btn"
              onClick={() => navigate('/student/profile')}
              className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white transition-all active:scale-90"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              aria-label="Profile"
            >
              {user?.profile_photo ? (
                <img src={user.profile_photo} className="w-full h-full rounded-full object-cover" alt="avatar" />
              ) : initial}
            </button>
          </div>
        </header>

        {/* ── Welcome Hero Card ──────────────────────────────────────────────── */}
        <div
          className="relative rounded-2xl p-4 mb-3.5 overflow-hidden anim-fade-up anim-delay-1"
          style={{
            border: '1px solid rgba(99,102,241,0.25)',
            boxShadow: '0 4px 24px rgba(79,70,229,0.2)',
            background: '#0e0b24',
          }}
        >
          {/* Full-box background building image */}
          <img
            src="/onboarding-building-only.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-center opacity-40 select-none pointer-events-none"
          />

          {/* Gradient overlay for readability and vibrant ambient atmosphere */}
          <div
            className="absolute inset-0 pointer-events-none select-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(14, 11, 36, 0.90) 0%, rgba(30, 27, 75, 0.72) 55%, rgba(14, 11, 36, 0.85) 100%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <p className="text-indigo-300 text-[11px] font-semibold">{getGreeting()}</p>
            <h1 className="text-white text-xl font-black leading-tight mt-0.5">
              Hello, {firstName} 👋
            </h1>

            {/* Room & Hostel badges */}
            <div className="flex items-center flex-wrap gap-1.5 mt-2">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <Home style={{ width: 10, height: 10 }} /> Room {user?.room ?? '—'}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <Building2 style={{ width: 10, height: 10 }} /> {user?.hostel ?? '—'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 mt-2">
              <p className="text-indigo-300/70 text-[10px] italic">
                "Same Hostel. A Better Tomorrow."
              </p>

              {/* Today's Mess Rating (if available) */}
              {todayMessAvg && (
                <div
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: 'rgba(255,255,255,0.10)' }}
                >
                  <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                  <span className="text-white text-[11px] font-semibold">
                    Mess: {todayMessAvg.toFixed(1)}/5
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Complaint Overview (Compact Sleek Cards) ───────────────────────── */}
        <div className="flex items-center justify-between mb-2 anim-fade-up anim-delay-2">
          <h2 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>Complaint Overview</h2>
          <button
            onClick={() => navigate('/student/complaints')}
            className="flex items-center gap-0.5 text-indigo-500 text-[11px] font-semibold hover:text-indigo-400 transition-colors active:opacity-70"
          >
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3.5 anim-fade-up anim-delay-2">
          {/* Open */}
          <button
            onClick={() => navigate('/student/complaints')}
            className="text-center p-2.5 py-2 rounded-xl transition-all active:scale-95"
            style={{ background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.2)' }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center mx-auto mb-1"
              style={{ background: 'rgba(249,115,22,0.15)' }}
            >
              <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <p className="text-lg font-black text-orange-500 leading-none">{stats.open}</p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>Open</p>
          </button>

          {/* In Progress */}
          <button
            onClick={() => navigate('/student/complaints')}
            className="text-center p-2.5 py-2 rounded-xl transition-all active:scale-95"
            style={{ background: 'rgba(139,92,246,0.10)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center mx-auto mb-1"
              style={{ background: 'rgba(139,92,246,0.15)' }}
            >
              <Clock className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <p className="text-lg font-black text-purple-500 leading-none">{stats.inProgress}</p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>In Progress</p>
          </button>

          {/* Resolved */}
          <button
            onClick={() => navigate('/student/complaints')}
            className="text-center p-2.5 py-2 rounded-xl transition-all active:scale-95"
            style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center mx-auto mb-1"
              style={{ background: 'rgba(16,185,129,0.15)' }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-lg font-black text-emerald-500 leading-none">{stats.resolved}</p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>Resolved</p>
          </button>
        </div>

        {/* ── Quick Actions (Compact Sleek Buttons) ──────────────────────────── */}
        <div className="flex items-center justify-between mb-2 anim-fade-up anim-delay-3">
          <h2 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>Quick Actions</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3.5 anim-fade-up anim-delay-3">
          {/* Report a Problem */}
          <button
            id="qa-report"
            onClick={() => navigate('/student/report')}
            className="text-left p-2.5 px-3 rounded-xl transition-all active:scale-95 flex items-center gap-2.5"
            style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.18)' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(249,115,22,0.15)' }}
            >
              <Wrench className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs leading-tight truncate" style={{ color: 'var(--text-heading)' }}>Report Problem</p>
              <p className="text-[10px] mt-0.5 leading-none truncate" style={{ color: 'var(--text-muted)' }}>Submit issue</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Rate Today's Food */}
          <button
            id="qa-mess"
            onClick={() => navigate('/student/mess')}
            className="text-left p-2.5 px-3 rounded-xl transition-all active:scale-95 flex items-center gap-2.5"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(16,185,129,0.15)' }}
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs leading-tight truncate" style={{ color: 'var(--text-heading)' }}>Rate Food</p>
              <p className="text-[10px] mt-0.5 leading-none truncate" style={{ color: 'var(--text-muted)' }}>Mess feedback</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* My Complaints */}
          <button
            id="qa-complaints"
            onClick={() => navigate('/student/complaints')}
            className="text-left p-2.5 px-3 rounded-xl transition-all active:scale-95 flex items-center gap-2.5"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.18)' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(59,130,246,0.15)' }}
            >
              <ClipboardList className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs leading-tight truncate" style={{ color: 'var(--text-heading)' }}>My Complaints</p>
              <p className="text-[10px] mt-0.5 leading-none truncate" style={{ color: 'var(--text-muted)' }}>Track status</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Notifications */}
          <button
            id="qa-notifications"
            onClick={() => navigate('/student/notifications')}
            className="text-left p-2.5 px-3 rounded-xl transition-all active:scale-95 flex items-center gap-2.5"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)' }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 relative"
              style={{ background: 'rgba(139,92,246,0.15)' }}
            >
              <Bell className="w-3.5 h-3.5 text-purple-500" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ fontSize: 7, background: '#ef4444' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs leading-tight truncate" style={{ color: 'var(--text-heading)' }}>Notifications</p>
              <p className="text-[10px] mt-0.5 leading-none truncate" style={{ color: 'var(--text-muted)' }}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'Latest alerts'}
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* ── Recent Complaints ──────────────────────────────────────────────── */}
        {recentComplaints.length > 0 ? (
          <div className="anim-fade-up anim-delay-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>Recent Complaints</h2>
              <button
                onClick={() => navigate('/student/complaints')}
                className="flex items-center gap-0.5 text-indigo-500 text-[11px] font-semibold hover:text-indigo-400 transition-colors active:opacity-70"
              >
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {recentComplaints.map(complaint => {
                const sc = STATUS_CONFIG[complaint.status] ?? STATUS_CONFIG.pending;
                return (
                  <button
                    key={complaint.id}
                    onClick={() => navigate(`/student/complaints/${complaint.id}`)}
                    className="w-full text-left rounded-xl p-3 transition-all active:scale-[0.98] flex items-center gap-2.5"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    {/* Status dot */}
                    <div className="shrink-0">
                      <span className={`block w-2 h-2 rounded-full ${sc.dot}`} />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs truncate" style={{ color: 'var(--text-heading)' }}>{complaint.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{complaint.complaint_id}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>· {timeAgo(complaint.created_at)}</span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0 flex items-center gap-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${sc.bg} ${sc.text}`}
                      >
                        {sc.label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Empty State ──────────────────────────────────────────────────── */
          <div
            className="rounded-2xl p-5 text-center anim-fade-up anim-delay-4"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-2"
              style={{ background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <Home className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-heading)' }}>All looks good!</p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>No complaints submitted yet.</p>
            <button
              onClick={() => navigate('/student/report')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              <Wrench className="w-3.5 h-3.5" />
              Report a Problem
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </>
  );
}
