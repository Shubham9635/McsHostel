import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi, complaintsApi, messApi, notificationsApi } from '../../services/api';
import type { AdminStats, Complaint, Staff, MessAnalytics as MessAnalyticsType, Notification } from '../../types';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  ClipboardList,
  Users,
  Star,
  TrendingUp,
  Zap,
  ArrowRight,
  Plus,
  Calendar,
  Wrench,
  UtensilsCrossed,
  Bell,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  User,
  Activity,
  Check,
  ChevronRight,
  Flame,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { StatusBadge, PriorityBadge } from '../../components/ComplaintCard';

const CATEGORY_COLORS = [
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#38bdf8', // Sky
  '#f97316', // Orange
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#14b8a6', // Teal
  '#8b5cf6', // Violet
  '#64748b', // Slate
];

const MEAL_SCHEDULE = [
  { name: 'Breakfast', time: '7:30 AM – 9:00 AM', key: 'breakfast' },
  { name: 'Lunch', time: '12:45 PM – 2:15 PM', key: 'lunch' },
  { name: 'Snacks', time: '5:00 PM – 5:30 PM', key: 'snacks' },
  { name: 'Dinner', time: '7:30 PM – 9:00 PM', key: 'dinner' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [messData, setMessData] = useState<MessAnalyticsType | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    Promise.all([
      adminApi.getStats(),
      complaintsApi.getAll(),
      messApi.getAnalytics().catch(() => ({ data: null })),
      notificationsApi.getAll().catch(() => ({ data: [] })),
    ])
      .then(([statsRes, complaintsRes, messRes, notifRes]) => {
        setStats(statsRes.data);
        const complaintsList: Complaint[] = complaintsRes.data || [];
        // Sort latest first
        complaintsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecentComplaints(complaintsList);
        setMessData(messRes.data);
        const notifs = notifRes.data?.notifications || notifRes.data || [];
        setNotifications(Array.isArray(notifs) ? notifs : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Compute Greeting based on local hour
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Compute Trend Data for Activity Chart based purely on real student complaint records
  const getTrendData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const result = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const targetDate = subDays(now, i);
      const dateStr = format(targetDate, 'yyyy-MM-dd');
      const label = days <= 14 ? format(targetDate, 'dd MMM') : format(targetDate, 'dd/MM');

      // Count actual complaints submitted by students on this date
      const reported = recentComplaints.filter(c => {
        if (!c.created_at) return false;
        return c.created_at.split('T')[0] === dateStr;
      }).length;

      // Count actual complaints resolved on this date
      const resolved = recentComplaints.filter(c => {
        if (c.status !== 'resolved') return false;
        const resolvedDate = (c.resolved_at || c.created_at)?.split('T')[0];
        return resolvedDate === dateStr;
      }).length;

      result.push({
        date: dateStr,
        label,
        reported,
        resolved,
      });
    }
    return result;
  };

  const trendData = getTrendData();

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-12 w-64 rounded-2xl bg-white/5 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-28 rounded-3xl bg-white/5 border border-white/5 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 rounded-3xl bg-white/5 lg:col-span-2 animate-pulse" />
          <div className="h-80 rounded-3xl bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const resolutionPercentage =
    stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  // Staff availability breakdown
  const busyStaffCount = stats.staff.filter(s =>
    recentComplaints.some(
      c => c.assigned_staff === s.id && (c.status === 'assigned' || c.status === 'in_progress')
    )
  ).length;
  const availableStaffCount = Math.max(0, stats.staff.length - busyStaffCount);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* ═══════════════════════════════════════════════════════════════════
          1. GREETING BANNER & QUICK CONTROLS
      ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-3xl p-6 sm:p-8 border border-indigo-500/25 relative overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #2d2475 100%)',
        }}
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-purple-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-indigo-200 mb-2.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span>{format(new Date(), 'EEEE, dd MMMM yyyy')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {greeting}, Admin <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="text-indigo-100/80 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
              Here's what's happening across your hostel today. Live complaint dispatches, staff performance, and mess satisfaction ratings.
            </p>
          </div>

          {/* Quick Action shortcuts */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => navigate('/admin/complaints')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all duration-200 active:scale-95 shadow-lg shadow-indigo-600/30 border border-indigo-400/30 hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Manage Complaints</span>
            </button>
            <button
              onClick={() => navigate('/admin/staff')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all active:scale-95"
            >
              <Wrench className="w-4 h-4 text-indigo-300" />
              <span>Staff Overview</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          2. KPI / STATISTICS CARDS (8 Real-Data Metrics)
      ═══════════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Real-Time Campus Metrics
          </h2>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" /> Live Supabase Feed
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Complaints */}
          <div
            className="p-4 sm:p-5 rounded-3xl border border-[var(--border-color)] hover:border-indigo-500/40 transition-all duration-200 shadow-lg group"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Total Complaints
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[var(--text-heading)]">{stats.total}</p>
            <p className="text-[11px] text-indigo-500 dark:text-indigo-400 font-semibold mt-1">All logged campus issues</p>
          </div>

          {/* Card 2: Pending */}
          <div
            className="p-4 sm:p-5 rounded-3xl border border-[var(--border-color)] hover:border-amber-500/40 transition-all duration-200 shadow-lg group"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Pending
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400">{stats.pending}</p>
            <p className="text-[11px] text-[var(--text-muted)] font-semibold mt-1">Awaiting staff assignment</p>
          </div>

          {/* Card 3: In Progress */}
          <div
            className="p-4 sm:p-5 rounded-3xl border border-[var(--border-color)] hover:border-purple-500/40 transition-all duration-200 shadow-lg group"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                In Progress
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-500 dark:text-purple-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-purple-500 dark:text-purple-400">{stats.in_progress}</p>
            <p className="text-[11px] text-[var(--text-muted)] font-semibold mt-1">
              {stats.assigned && stats.assigned > 0
                ? `${stats.assigned} assigned • ${Math.max(0, stats.in_progress - stats.assigned)} active`
                : 'Being resolved by staff'}
            </p>
          </div>

          {/* Card 4: Resolved */}
          <div
            className="p-4 sm:p-5 rounded-3xl border border-[var(--border-color)] hover:border-emerald-500/40 transition-all duration-200 shadow-lg group"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Resolved
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-500 dark:text-emerald-400">{stats.resolved}</p>
            <p className="text-[11px] text-[var(--text-muted)] font-semibold mt-1">Successfully closed</p>
          </div>

          {/* Card 5: Average Resolution Time */}
          <div
            className="p-4 sm:p-5 rounded-3xl border border-[var(--border-color)] hover:border-indigo-500/40 transition-all duration-200 shadow-lg group"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Avg Resolution
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[var(--text-heading)]">
              {stats.avg_resolution_days > 0 ? `${stats.avg_resolution_days}d` : '0d'}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] font-semibold mt-1">Turnaround per complaint</p>
          </div>

          {/* Card 6: Today's Mess Rating */}
          <div
            className="p-4 sm:p-5 rounded-3xl border border-[var(--border-color)] hover:border-orange-500/40 transition-all duration-200 shadow-lg group"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Today's Mess
              </span>
              <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-500 dark:text-orange-400 flex items-center justify-center">
                <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-orange-500 dark:text-orange-400">
              {stats.today_mess_avg > 0 ? `${stats.today_mess_avg} / 5` : 'N/A'}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] font-semibold mt-1">
              {stats.today_mess_count} reviews submitted today
            </p>
          </div>

          {/* Card 7: Registered Students */}
          <div
            className="p-4 sm:p-5 rounded-3xl border border-[var(--border-color)] hover:border-emerald-500/40 transition-all duration-200 shadow-lg group"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Students
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-[var(--text-heading)]">{stats.total_students}</p>
            <p className="text-[11px] text-emerald-500 dark:text-emerald-400 font-semibold mt-1">Active verified accounts</p>
          </div>

          {/* Card 8: Resolution Rate */}
          <div
            className="p-4 sm:p-5 rounded-3xl border border-[var(--border-color)] hover:border-purple-500/40 transition-all duration-200 shadow-lg group"
            style={{ background: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Resolution Rate
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-500 dark:text-purple-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-purple-500 dark:text-purple-400">
              {resolutionPercentage}%
            </p>
            <p className="text-[11px] text-[var(--text-muted)] font-semibold mt-1">
              {stats.resolved} of {stats.total} complaints solved
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          3. COMPLAINT ACTIVITY TREND (Line/Area Chart with Filters)
      ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="p-6 rounded-3xl border border-[var(--border-color)] shadow-2xl space-y-4"
        style={{ background: 'var(--bg-card)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[var(--text-heading)] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Complaint Activity Trend
            </h2>
            <p className="text-[var(--text-muted)] text-xs">
              Daily incoming vs. resolved maintenance tickets across campus
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] self-start sm:self-auto">
            {(['7d', '30d', '90d'] as const).map(period => (
              <button
                key={period}
                onClick={() => setTimeRange(period)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeRange === period
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
                }`}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '3 Months'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="reportedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.12)" />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                allowDecimals={false}
                domain={[0, (dataMax: number) => Math.max(5, dataMax)]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-color)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  fontSize: '12px',
                  color: 'var(--text-heading)',
                }}
              />
              <Area
                type="monotone"
                dataKey="reported"
                stroke="#818cf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#reportedGradient)"
                name="New Complaints"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#34d399"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#resolvedGradient)"
                name="Resolved"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 pt-2 border-t border-[var(--border-subtle)] text-xs font-semibold">
          <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-300">
            <span className="w-3 h-3 rounded-full bg-indigo-500" />
            <span>New Complaints</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-300">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Resolved</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          4. COMPLAINT ANALYTICS: Category Donut + Priority Progress
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown (Donut) */}
        <div
          className="p-6 rounded-3xl border border-[var(--border-color)] shadow-2xl flex flex-col justify-between"
          style={{ background: 'var(--bg-card)' }}
        >
          <div>
            <h2 className="text-lg font-black text-[var(--text-heading)] flex items-center gap-2 mb-1">
              <ClipboardList className="w-5 h-5 text-indigo-400" />
              Complaints by Category
            </h2>
            <p className="text-[var(--text-muted)] text-xs">
              Breakdown of issues reported by students across campus
            </p>
          </div>

          {stats.category_stats.length === 0 ? (
            <div className="py-16 text-center text-[var(--text-muted)] text-sm">
              No complaint category data recorded yet.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
              <div className="w-44 h-44 shrink-0 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.category_stats}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="category"
                    >
                      {stats.category_stats.map((_, idx) => (
                        <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--bg-elevated)',
                        borderColor: 'var(--border-color)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: 'var(--text-heading)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-[var(--text-heading)]">{stats.total}</span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Total</span>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex-1 w-full space-y-2 max-h-48 overflow-y-auto pr-1">
                {stats.category_stats.map((cat, idx) => {
                  const pct = Math.round((cat.count / stats.total) * 100);
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                  return (
                    <div key={cat.category} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                        <span className="text-[var(--text-primary)] font-medium truncate">{cat.category}</span>
                      </div>
                      <span className="text-[var(--text-muted)] font-bold ml-2 shrink-0">
                        {cat.count} <span className="text-[var(--text-muted)] opacity-70">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs text-[var(--text-muted)]">
            <span>{stats.category_stats.length} active categories</span>
            <Link to="/admin/complaints" className="text-indigo-500 hover:text-indigo-400 font-bold flex items-center gap-1">
              Filter by Category <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Priority Distribution */}
        <div
          className="p-6 rounded-3xl border border-[var(--border-color)] shadow-2xl flex flex-col justify-between"
          style={{ background: 'var(--bg-card)' }}
        >
          <div>
            <h2 className="text-lg font-black text-[var(--text-heading)] flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-amber-400" />
              Complaint Priority Distribution
            </h2>
            <p className="text-[var(--text-muted)] text-xs">
              Severity classification of active and resolved issues
            </p>
          </div>

          <div className="space-y-4 my-4">
            {[
              {
                label: 'Urgent',
                value: stats.priority_stats.urgent,
                color: 'from-red-500 to-rose-600',
                badgeColor: 'text-red-500 bg-red-500/15 border-red-500/30',
                desc: 'Needs immediate attention (water leakage, short circuits, lockouts)',
              },
              {
                label: 'Medium',
                value: stats.priority_stats.medium,
                color: 'from-amber-400 to-orange-500',
                badgeColor: 'text-amber-500 bg-amber-500/15 border-amber-500/30',
                desc: 'Standard maintenance (flickering lights, slow Wi-Fi, minor leaks)',
              },
              {
                label: 'Normal',
                value: stats.priority_stats.normal,
                color: 'from-slate-400 to-slate-500',
                badgeColor: 'text-slate-500 dark:text-slate-400 bg-slate-500/15 border-slate-500/30',
                desc: 'General upkeep (cleaning, cosmetic fixtures, chair repair)',
              },
            ].map(p => {
              const pct = stats.total > 0 ? Math.round((p.value / stats.total) * 100) : 0;
              return (
                <div key={p.label} className="p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={`px-2 py-0.5 rounded-full border ${p.badgeColor}`}>
                      {p.label} Priority
                    </span>
                    <span className="text-[var(--text-heading)]">
                      {p.value} <span className="text-[var(--text-muted)] font-normal">({pct}%)</span>
                    </span>
                  </div>

                  <div className="h-2 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${p.color} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)] leading-tight">{p.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs text-[var(--text-muted)]">
            <span>{stats.priority_stats.urgent} urgent tickets open</span>
            <Link to="/admin/complaints" className="text-indigo-500 hover:text-indigo-400 font-bold flex items-center gap-1">
              View Urgent Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          5. RECENT COMPLAINTS TABLE / STACKED CARDS
      ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="p-6 rounded-3xl border border-[var(--border-color)] shadow-2xl space-y-4"
        style={{ background: 'var(--bg-card)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[var(--text-heading)] flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-400" />
              Recent Maintenance Complaints
            </h2>
            <p className="text-[var(--text-muted)] text-xs">
              Latest tickets logged by hostel residents requiring administrative oversight
            </p>
          </div>

          <Link
            to="/admin/complaints"
            className="text-xs sm:text-sm font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-muted)] text-sm">
            No complaints logged yet.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--text-primary)]">
                <thead className="text-xs uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                  <tr>
                    <th className="py-3 px-4">Ticket</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Hostel / Room</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Staff</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {recentComplaints.slice(0, 6).map(c => (
                    <tr key={c.id} className="hover:bg-[var(--bg-primary)] transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-indigo-500 dark:text-indigo-400 font-bold">
                          {c.complaint_id}
                        </span>
                        <p className="text-[var(--text-heading)] font-semibold text-xs truncate max-w-[180px]">
                          {c.title}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="text-[var(--text-primary)] font-medium">{c.student_name || 'Student'}</span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="text-[var(--text-heading)] font-semibold">{c.room}</span>
                        <span className="text-[var(--text-muted)] block text-[11px]">{c.hostel}</span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[11px] font-medium">
                          {c.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-4 text-xs text-[var(--text-muted)]">
                        {c.assigned_staff_name ? (
                          <span className="text-indigo-500 dark:text-indigo-300 font-medium flex items-center gap-1">
                            <Wrench className="w-3 h-3" /> {c.assigned_staff_name}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)] italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to="/admin/complaints"
                          className="px-3 py-1 rounded-xl bg-[var(--bg-primary)] hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 border border-[var(--border-subtle)] text-xs font-bold transition-colors inline-block"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards (Zero horizontal scroll) */}
            <div className="md:hidden space-y-3">
              {recentComplaints.slice(0, 5).map(c => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs text-indigo-500 dark:text-indigo-400 font-bold">
                        {c.complaint_id}
                      </span>
                      <h4 className="text-sm font-bold text-[var(--text-heading)] leading-tight mt-0.5">
                        {c.title}
                      </h4>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>{c.room} · {c.hostel}</span>
                    <span>•</span>
                    <PriorityBadge priority={c.priority} />
                    <span>•</span>
                    <span>{c.student_name}</span>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">
                      Staff: <strong className="text-[var(--text-heading)]">{c.assigned_staff_name || 'Unassigned'}</strong>
                    </span>
                    <Link to="/admin/complaints" className="text-indigo-500 dark:text-indigo-400 font-bold flex items-center gap-1">
                      Manage <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          6. BOTTOM SECTION: Staff Workload + Mess Analytics Summary
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Overview */}
        <div
          className="p-6 rounded-3xl border border-[var(--border-color)] shadow-2xl flex flex-col justify-between"
          style={{ background: 'var(--bg-card)' }}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-black text-[var(--text-heading)] flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-400" />
                Staff Workload &amp; Availability
              </h2>
              <Link to="/admin/staff" className="text-xs font-bold text-indigo-500 hover:text-indigo-400">
                All Staff ({stats.staff.length}) →
              </Link>
            </div>
            <p className="text-[var(--text-muted)] text-xs mb-4">
              Real-time staff occupancy and active assigned complaints
            </p>

            {/* Availability pills */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              <div className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Total Staff</span>
                <span className="text-lg font-black text-[var(--text-heading)]">{stats.staff.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Available</span>
                <span className="text-lg font-black text-emerald-500 dark:text-emerald-400">{availableStaffCount}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Busy</span>
                <span className="text-lg font-black text-amber-500 dark:text-amber-400">{busyStaffCount}</span>
              </div>
            </div>

            {/* Staff list */}
            <div className="space-y-2">
              {stats.staff.slice(0, 4).map(s => {
                const assignedCount = recentComplaints.filter(
                  c => c.assigned_staff === s.id && (c.status === 'assigned' || c.status === 'in_progress')
                ).length;
                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-500 dark:text-indigo-300 font-bold text-sm flex items-center justify-center">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-heading)] text-sm leading-tight">{s.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{s.role}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        assignedCount > 0
                          ? 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {assignedCount > 0 ? `${assignedCount} active` : 'Available'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs text-[var(--text-muted)]">
            <span>Automatic student notification on staff assignment</span>
            <Link to="/admin/staff" className="text-indigo-500 dark:text-indigo-400 font-bold">
              Manage Staff Directory →
            </Link>
          </div>
        </div>

        {/* Mess Quick Performance */}
        <div
          className="p-6 rounded-3xl border border-[var(--border-color)] shadow-2xl flex flex-col justify-between"
          style={{ background: 'var(--bg-card)' }}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-black text-[var(--text-heading)] flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-purple-400" />
                Today's Mess Schedule &amp; Ratings
              </h2>
              <Link to="/admin/mess" className="text-xs font-bold text-purple-500 hover:text-purple-400">
                Detailed Analytics →
              </Link>
            </div>
            <p className="text-[var(--text-muted)] text-xs mb-4">
              Real-time student feedback and schedule compliance
            </p>

            <div className="space-y-3">
              {MEAL_SCHEDULE.map(meal => {
                const stat = messData?.meal_stats?.find(m => m.meal === meal.key);
                return (
                  <div
                    key={meal.key}
                    className="p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-[var(--text-heading)] text-sm">{meal.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{meal.time}</p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-black text-[var(--text-heading)] text-sm">
                          {stat?.avg_rating ? `${stat.avg_rating}` : '—'}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {stat?.count ? `${stat.count} reviews` : 'No reviews today'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs text-[var(--text-muted)]">
            <span>Overall rating: <strong className="text-[var(--text-heading)]">{messData?.overall_avg || '0.0'} / 5.0</strong></span>
            <Link to="/admin/mess" className="text-purple-500 dark:text-purple-400 font-bold">
              View Student Reviews →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
