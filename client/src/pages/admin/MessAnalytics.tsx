import React, { useEffect, useState } from 'react';
import { messApi } from '../../services/api';
import type { MessAnalytics as MessAnalyticsType } from '../../types';
import StarRating from '../../components/StarRating';
import { format } from 'date-fns';
import {
  Star,
  TrendingUp,
  UtensilsCrossed,
  MessageSquare,
  Clock,
  Sparkles,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  User,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

const MEAL_CONFIGS: Record<string, { name: string; time: string; icon: string; color: string; border: string; bg: string }> = {
  breakfast: {
    name: 'Breakfast',
    time: '7:30 AM – 9:00 AM',
    icon: '🍳',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
  },
  lunch: {
    name: 'Lunch',
    time: '12:45 PM – 2:15 PM',
    icon: '🍛',
    color: 'text-indigo-400',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
  },
  snacks: {
    name: 'Snacks',
    time: '5:00 PM – 5:30 PM',
    icon: '☕',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
  },
  dinner: {
    name: 'Dinner',
    time: '7:30 PM – 9:00 PM',
    icon: '🍽️',
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
  },
};

export default function MessAnalytics() {
  const [analytics, setAnalytics] = useState<MessAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messApi.getAnalytics()
      .then(res => setAnalytics(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-52 rounded-2xl bg-[var(--border-subtle)] animate-pulse" />
        <div className="h-44 rounded-3xl bg-[var(--border-subtle)] animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-3xl bg-[var(--border-subtle)] animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-3xl bg-[var(--border-subtle)] animate-pulse" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-12 text-center text-[var(--text-muted)] text-sm">
        Unable to load mess analytics data.
      </div>
    );
  }

  // Calculate positive vs constructive reviews
  const positiveReviews = analytics.recent_reviews.filter(r => r.rating >= 4).length;
  const criticalReviews = analytics.recent_reviews.filter(r => r.rating < 3).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-heading)] tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-purple-400">
              <UtensilsCrossed className="w-6 h-6" />
            </span>
            Mess Performance &amp; Analytics
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Student food satisfaction, meal schedules, rating trends and qualitative feedback
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)]">
            Total Reviews: <strong className="text-[var(--text-heading)] font-bold">{analytics.total_reviews}</strong>
          </div>
        </div>
      </div>

      {/* ── Overall Rating Hero Card ────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 sm:p-8 border border-[var(--border-color)] relative overflow-hidden shadow-2xl"
        style={{
          background: 'var(--bg-card)',
        }}
      >
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="text-center md:text-left space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-4 h-4" /> Campus Food Satisfaction
            </span>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="text-5xl sm:text-6xl font-black text-[var(--text-heading)] tracking-tight">
                {analytics.overall_avg.toFixed(1)}
              </span>
              <div>
                <span className="text-[var(--text-muted)] text-sm block">out of 5.0</span>
                <StarRating value={Math.round(analytics.overall_avg)} readonly size="md" />
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Aggregated across all breakfast, lunch, snacks, and dinner ratings
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            <div
              className="p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-3.5 bg-[var(--bg-primary)]"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-emerald-400">{positiveReviews}</p>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Positive Reviews (4-5★)</p>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-3.5 bg-[var(--bg-primary)]"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <ThumbsDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black text-rose-400">{criticalReviews}</p>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Needs Work (&lt;3★)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Meal-wise Breakdown & Schedule ─────────────────────────────── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
          Daily Meals Schedule &amp; Rating Averages
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Object.entries(MEAL_CONFIGS).map(([key, config]) => {
            const stat = analytics.meal_stats?.find(m => m.meal === key);
            return (
              <div
                key={key}
                className="p-5 rounded-3xl border border-[var(--border-color)] shadow-lg space-y-3"
                style={{ background: 'var(--bg-card)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h3 className="font-bold text-[var(--text-heading)] text-base">{config.name}</h3>
                      <span className="text-[11px] text-[var(--text-muted)] block">{config.time}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-baseline justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-2xl font-black text-[var(--text-heading)]">
                      {stat?.avg_rating ? `${stat.avg_rating}` : '—'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">/ 5</span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    {stat?.count || 0} reviews
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 7-Day Trend Chart & Meal Breakdown Bar Chart ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Trend */}
        <div
          className="p-6 rounded-3xl border border-[var(--border-color)] shadow-2xl space-y-4"
          style={{ background: 'var(--bg-card)' }}
        >
          <div>
            <h2 className="text-lg font-black text-[var(--text-heading)] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              7-Day Mess Rating Trend
            </h2>
            <p className="text-[var(--text-secondary)] text-xs">
              Daily average satisfaction scored by hostel students
            </p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.daily_data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={d => {
                    try { return format(new Date(d + 'T00:00:00'), 'dd/MM'); } catch { return d; }
                  }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 5]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [Number(val || 0).toFixed(1), 'Avg Rating']}
                  labelFormatter={d => {
                    try { return format(new Date(d + 'T00:00:00'), 'dd MMMM yyyy'); } catch { return d; }
                  }}
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--text-heading)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 1.5 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Meal Rating Distribution Bar Chart */}
        <div
          className="p-6 rounded-3xl border border-[var(--border-color)] shadow-2xl space-y-4"
          style={{ background: 'var(--bg-card)' }}
        >
          <div>
            <h2 className="text-lg font-black text-[var(--text-heading)] flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-purple-400" />
              Daily Satisfaction Levels
            </h2>
            <p className="text-[var(--text-secondary)] text-xs">
              Color coded: ≥4.0 (Great), ≥3.0 (Satisfactory), &lt;3.0 (Needs Improvement)
            </p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.daily_data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={d => {
                    try { return format(new Date(d + 'T00:00:00'), 'dd/MM'); } catch { return d; }
                  }}
                  tickLine={false}
                />
                <YAxis domain={[0, 5]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--text-heading)',
                  }}
                  labelFormatter={d => {
                    try { return format(new Date(d + 'T00:00:00'), 'dd MMMM yyyy'); } catch { return d; }
                  }}
                />
                <Bar dataKey="avg" radius={[6, 6, 0, 0]} name="Avg Rating">
                  {analytics.daily_data.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.avg >= 4 ? '#10b981' : entry.avg >= 3 ? '#6366f1' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-4 justify-center text-xs font-semibold text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)]">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> ≥4.0 Great</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400" /> ≥3.0 Good</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" /> &lt;3.0 Critical</span>
          </div>
        </div>
      </div>

      {/* ── Recent Student Reviews Feed ─────────────────────────────────── */}
      <div
        className="p-6 rounded-3xl border border-[var(--border-color)] shadow-2xl space-y-4"
        style={{ background: 'var(--bg-card)' }}
      >
        <div>
          <h2 className="text-lg font-black text-[var(--text-heading)] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Recent Student Reviews
          </h2>
          <p className="text-[var(--text-secondary)] text-xs">
            Direct qualitative feedback submitted by residents after meals
          </p>
        </div>

        {analytics.recent_reviews.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-muted)] text-sm">
            No meal reviews yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {analytics.recent_reviews.slice(0, 8).map(review => {
              const mealConfig = MEAL_CONFIGS[review.meal_type] || {
                name: review.meal_type,
                icon: '🍽️',
              };

              return (
                <div
                  key={review.id}
                  className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{mealConfig.icon}</span>
                      <div>
                        <p className="font-bold text-[var(--text-heading)] text-sm">
                          {review.anonymous ? 'Anonymous Student' : review.student_name || 'Student'}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {format(new Date(review.date), 'dd MMM yyyy')} · <span className="capitalize">{review.meal_type}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-[var(--bg-card)] px-2.5 py-1 rounded-full border border-[var(--border-subtle)]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-[var(--text-heading)]">{review.rating}</span>
                    </div>
                  </div>

                  {review.review && (
                    <p className="text-xs text-[var(--text-primary)] italic leading-relaxed pl-2 border-l-2 border-indigo-400/50">
                      "{review.review}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
