import React, { useEffect, useState } from 'react';
import { messApi } from '../../services/api';
import StarRating from '../../components/StarRating';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Utensils,
  Clock,
  Calendar,
  Sparkles,
  History,
  CheckCircle2,
  ArrowRight,
  Loader2,
  EyeOff,
  Star,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

interface MealSummary {
  meal: MealType;
  count: number;
  avg_rating: number | null;
  my_review: any;
}

interface MealConfigItem {
  icon: string;
  label: string;
  time: string;
  bgImage: string;
  placeholder: string;
  accentBadge: string;
  accentBorder: string;
  accentText: string;
}

// ── Strict meal configuration (Order: Breakfast -> Lunch -> Snacks -> Dinner) ─

const MEAL_CONFIG: Record<MealType, MealConfigItem> = {
  breakfast: {
    icon: '🍳',
    label: 'Breakfast',
    time: '7:30 AM – 9:00 AM',
    bgImage: '/meals/breakfast.jpg',
    placeholder: 'Share breakfast feedback...',
    accentBadge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    accentBorder: 'border-orange-500/20 hover:border-orange-500/40',
    accentText: 'text-orange-400',
  },
  lunch: {
    icon: '🍛',
    label: 'Lunch',
    time: '12:45 PM – 2:15 PM',
    bgImage: '/meals/lunch.jpg',
    placeholder: 'Share lunch feedback...',
    accentBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    accentBorder: 'border-emerald-500/20 hover:border-emerald-500/40',
    accentText: 'text-emerald-400',
  },
  snacks: {
    icon: '☕',
    label: 'Snacks',
    time: '5:00 PM – 5:30 PM',
    bgImage: '/meals/snacks.jpg',
    placeholder: 'Share snacks feedback...',
    accentBadge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    accentBorder: 'border-purple-500/20 hover:border-purple-500/40',
    accentText: 'text-purple-400',
  },
  dinner: {
    icon: '🍽️',
    label: 'Dinner',
    time: '7:30 PM – 9:00 PM',
    bgImage: '/meals/dinner.jpg',
    placeholder: 'Share dinner feedback...',
    accentBadge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    accentBorder: 'border-blue-500/20 hover:border-blue-500/40',
    accentText: 'text-blue-400',
  },
};

const ORDERED_MEALS: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner'];

// ── Skeletons ─────────────────────────────────────────────────────────────────

function MealCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-3.5 border border-white/5 relative overflow-hidden"
      style={{ background: 'rgba(17, 14, 40, 0.65)' }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="h-5 w-32 skeleton-dark rounded-lg" />
        <div className="h-5 w-14 skeleton-dark rounded-lg" />
      </div>
      <div className="h-7 w-44 skeleton-dark rounded-lg mb-2" />
      <div className="h-8 w-full skeleton-dark rounded-xl mb-2" />
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 skeleton-dark rounded-md" />
        <div className="h-7 w-20 skeleton-dark rounded-lg" />
      </div>
    </div>
  );
}

// ── Main Page Component ────────────────────────────────────────────────────────

export default function MessFeedbackPage() {
  const [today] = useState(() => new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rate' | 'history'>('rate');
  const [history, setHistory] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  // Form state per meal
  const [forms, setForms] = useState<
    Record<MealType, { rating: number; review: string; anonymous: boolean }>
  >({
    breakfast: { rating: 0, review: '', anonymous: false },
    lunch: { rating: 0, review: '', anonymous: false },
    snacks: { rating: 0, review: '', anonymous: false },
    dinner: { rating: 0, review: '', anonymous: false },
  });
  const [submitting, setSubmitting] = useState<MealType | null>(null);

  // Load today's meals
  const loadTodayMeals = () => {
    return messApi
      .getToday()
      .then(res => {
        const rawMeals: MealSummary[] = res.data.meals || [];
        setMeals(rawMeals);
        // Pre-fill forms with existing reviews
        rawMeals.forEach((m: MealSummary) => {
          if (m.my_review) {
            setForms(prev => ({
              ...prev,
              [m.meal]: {
                rating: m.my_review.rating || 0,
                review: m.my_review.review || m.my_review.review_text || '',
                anonymous: !!m.my_review.anonymous,
              },
            }));
          }
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadTodayMeals().finally(() => setLoading(false));
  }, []);

  // Load history when switching to tab
  useEffect(() => {
    if (activeTab === 'history') {
      setHistLoading(true);
      messApi
        .getReviews({ my_only: 'true' })
        .then(res => setHistory(res.data || []))
        .catch(() => {})
        .finally(() => setHistLoading(false));
    }
  }, [activeTab]);

  // Handle review submission
  const handleSubmit = async (meal: MealType) => {
    const form = forms[meal];
    if (!form.rating) {
      toast.error('Please select a star rating first');
      return;
    }

    setSubmitting(meal);
    try {
      await messApi.submitReview({
        meal_type: meal,
        date: today,
        rating: form.rating,
        review: form.review,
        anonymous: form.anonymous,
      });

      toast.success(`${MEAL_CONFIG[meal].label} rating submitted! ⭐`);
      await loadTodayMeals();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to submit review';
      toast.error(msg);
    } finally {
      setSubmitting(null);
    }
  };

  // Formatted date string
  const todayFormatted = format(new Date(), 'EEE, dd MMM yyyy');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-xl lg:max-w-4xl mx-auto px-3.5 sm:px-4 pt-3 sm:pt-4 pb-24">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <header className="flex items-center justify-between mb-3.5">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl" role="img" aria-label="utensils">
                🍴
              </span>
              <h1 className="text-lg sm:text-xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>Mess</h1>
            </div>
            <p className="text-[11px] sm:text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Rate food. Share feedback. Make it better!
            </p>
          </div>

          {/* Dynamic Date Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <div className="text-right leading-none">
              <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider block">
                Today
              </span>
              <span className="text-[11px] font-semibold mt-0.5 block" style={{ color: 'var(--text-primary)' }}>
                {todayFormatted}
              </span>
            </div>
          </div>
        </header>

        {/* ── Modern Tabs ──────────────────────────────────────────────────── */}
        <div
          className="p-0.5 rounded-xl flex items-center gap-1 mb-4 border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          role="tablist"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'rate'}
            onClick={() => setActiveTab('rate')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
              activeTab === 'rate'
                ? 'text-white shadow-lg'
                : 'hover:text-indigo-400'
            }`}
            style={
              activeTab === 'rate'
                ? {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    boxShadow: '0 2px 14px rgba(124, 58, 237, 0.35)',
                  }
                : { background: 'transparent', color: 'var(--text-secondary)' }
            }
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Rate Today
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 ${
              activeTab === 'history'
                ? 'text-white shadow-lg'
                : 'hover:text-indigo-400'
            }`}
            style={
              activeTab === 'history'
                ? {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    boxShadow: '0 2px 14px rgba(124, 58, 237, 0.35)',
                  }
                : { background: 'transparent', color: 'var(--text-secondary)' }
            }
          >
            <History className="w-3.5 h-3.5" />
            My History
          </button>
        </div>

        {/* ── TAB 1: Rate Today ────────────────────────────────────────────── */}
        {activeTab === 'rate' && (
          <>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <MealCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {ORDERED_MEALS.map(mealKey => {
                  const config = MEAL_CONFIG[mealKey];
                  const summary = meals.find(m => m.meal === mealKey);
                  const form = forms[mealKey];
                  const hasExisting = !!summary?.my_review;
                  const isSubmitting = submitting === mealKey;

                  return (
                    <div
                      key={mealKey}
                      className={`relative rounded-2xl p-3.5 border transition-all duration-200 overflow-hidden ${config.accentBorder}`}
                      style={{
                        background: 'var(--bg-card)',
                        borderColor: 'var(--border-color)',
                        boxShadow: 'var(--shadow-card)',
                      }}
                    >
                      {/* ── Subdued Ambient Food Background Image ───────────────── */}
                      <div
                        className="absolute inset-0 pointer-events-none select-none overflow-hidden"
                        aria-hidden="true"
                      >
                        {/* Image aligned right */}
                        <img
                          src={config.bgImage}
                          alt=""
                          loading="lazy"
                          className="absolute right-0 top-0 bottom-0 w-3/5 sm:w-1/2 h-full object-cover object-center opacity-10 sm:opacity-15 transition-opacity duration-300"
                        />
                        {/* Gradient mask to blend seamlessly */}
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              'linear-gradient(to right, var(--bg-card-solid) 35%, var(--bg-card) 70%, transparent 100%)',
                          }}
                        />
                      </div>

                      {/* ── Card Content (Cleanly sits on top of overlay) ──────── */}
                      <div className="relative z-10">

                        {/* Top: Meal Title, Timings & Community Rating */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0"
                              style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-subtle)',
                              }}
                            >
                              {config.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="text-sm sm:text-base font-bold leading-tight" style={{ color: 'var(--text-heading)' }}>
                                  {config.label}
                                </h2>
                                {hasExisting && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> Rated
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                                <span>{config.time}</span>
                              </div>
                            </div>
                          </div>

                          {/* Community Avg Rating (if available) */}
                          {summary?.avg_rating ? (
                            <div
                              className="px-2 py-0.5 rounded-lg flex items-center gap-1 shrink-0 border border-amber-500/20"
                              style={{ background: 'rgba(245, 158, 11, 0.1)' }}
                            >
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="text-amber-300 text-[11px] font-bold">
                                {summary.avg_rating.toFixed(1)}
                              </span>
                              <span className="text-slate-400 text-[9px] font-medium hidden sm:inline">
                                ({summary.count})
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {/* ── Compact Rating Row (Label + Stars inline) ────────── */}
                        <div className="flex items-center justify-between mb-2 px-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Your Rating
                          </span>
                          <StarRating
                            value={form.rating}
                            onChange={v =>
                              setForms(prev => ({
                                ...prev,
                                [mealKey]: { ...prev[mealKey], rating: v },
                              }))
                            }
                            size="md"
                            name={config.label}
                          />
                        </div>

                        {/* ── Compact Review Input ────────────────────────────── */}
                        <div className="mb-2">
                          <input
                            type="text"
                            id={`mess-review-${mealKey}`}
                            value={form.review}
                            onChange={e =>
                              setForms(prev => ({
                                ...prev,
                                [mealKey]: { ...prev[mealKey], review: e.target.value },
                              }))
                            }
                            placeholder={config.placeholder}
                            className="w-full px-3 py-1.5 rounded-xl text-xs focus:outline-none transition-all duration-200 border focus:border-indigo-500/60"
                            style={{
                              background: 'var(--input-bg)',
                              borderColor: 'var(--border-input)',
                              color: 'var(--input-text)',
                            }}
                          />
                        </div>

                        {/* ── Footer: Anonymous Checkbox + Submit Button ─────── */}
                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          {/* Anonymous Checkbox */}
                          <label
                            htmlFor={`anon-${mealKey}`}
                            className="flex items-center gap-1.5 cursor-pointer select-none group py-0.5"
                          >
                            <input
                              type="checkbox"
                              id={`anon-${mealKey}`}
                              checked={form.anonymous}
                              onChange={e =>
                                setForms(prev => ({
                                  ...prev,
                                  [mealKey]: { ...prev[mealKey], anonymous: e.target.checked },
                                }))
                              }
                              className="sr-only peer"
                            />
                            <div
                              className="w-3.5 h-3.5 rounded border border-slate-600 peer-checked:bg-indigo-600 peer-checked:border-indigo-500 flex items-center justify-center transition-all duration-150"
                              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                            >
                              {form.anonymous && (
                                <svg
                                  className="w-2.5 h-2.5 text-white"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium group-hover:text-slate-200 transition-colors">
                              Submit anonymously
                            </span>
                          </label>

                          {/* Modern Compact Submit Button */}
                          <button
                            id={`submit-${mealKey}-btn`}
                            type="button"
                            onClick={() => handleSubmit(mealKey)}
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs text-white transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-indigo-500/20"
                            style={{
                              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                              boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
                            }}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-white" />
                                <span>...</span>
                              </>
                            ) : (
                              <>
                                <span>{hasExisting ? 'Update' : 'Submit'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── TAB 2: My History ────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div>
            {histLoading ? (
              <div className="space-y-2.5">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="h-20 rounded-2xl skeleton-dark border border-white/5"
                  />
                ))}
              </div>
            ) : history.length === 0 ? (
              /* Empty state */
              <div
                className="rounded-2xl p-8 text-center border"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                  }}
                >
                  <Utensils className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-heading)' }}>No reviews yet</h3>
                <p className="text-xs mb-4 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
                  You haven't submitted any meal ratings yet. Start sharing your feedback today!
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('rate')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  Rate Today's Meals
                </button>
              </div>
            ) : (
              /* History Feed */
              <div className="space-y-2.5">
                {history.map(item => {
                  const mealKey = (item.meal_type || 'breakfast') as MealType;
                  const config = MEAL_CONFIG[mealKey] || MEAL_CONFIG.breakfast;
                  const reviewDate = item.review_date || item.date;
                  const formattedDate = reviewDate
                    ? format(new Date(reviewDate), 'dd MMM yyyy')
                    : 'Recent';

                  return (
                    <div
                      key={item.id}
                      className="rounded-xl p-3.5 border transition-all"
                      style={{
                        background: 'var(--bg-card)',
                        borderColor: 'var(--border-color)',
                        boxShadow: 'var(--shadow-card)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{config.icon}</span>
                          <div>
                            <p className="font-bold text-xs sm:text-sm" style={{ color: 'var(--text-heading)' }}>
                              {config.label}
                            </p>
                            <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                              {formattedDate}
                            </p>
                          </div>
                        </div>

                        <StarRating
                          value={item.rating || 0}
                          readonly
                          size="sm"
                          name={config.label}
                        />
                      </div>

                      {/* Review text */}
                      {(item.review || item.review_text) && (
                        <p className="text-slate-300 text-xs italic pl-2 border-l-2 border-indigo-500/40 my-1.5">
                          "{item.review || item.review_text}"
                        </p>
                      )}

                      {/* Anonymous indicator */}
                      {item.anonymous && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-1">
                          <EyeOff className="w-3 h-3" />
                          <span>Submitted anonymously</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
