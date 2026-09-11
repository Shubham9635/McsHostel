import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Building2,
  User as UserIcon,
  BedDouble,
  ArrowRight,
  LogOut,
  Sparkles,
  Wrench,
  BarChart3,
  UtensilsCrossed,
  ChevronDown,
} from 'lucide-react';

const HOSTEL_OPTIONS = [
  'New Girls Hostel',
  'Old Girls Hostel',
  'New Boys Hostel',
  'Old Boys Hostel',
  'Technova',
] as const;

function OrangeSwoop({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 10" className={className} fill="none">
      <path d="M3 7 Q36 1 69 7" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export default function OnboardingPage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [hostel, setHostel] = useState<string>(user?.hostel || HOSTEL_OPTIONS[0]);
  const [room, setRoom] = useState(user?.room || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!hostel) {
      toast.error('Please select your hostel');
      return;
    }
    if (!room.trim()) {
      toast.error('Please enter your room number');
      return;
    }

    setLoading(true);
    try {
      const updated = await updateProfile({
        name: name.trim(),
        hostel,
        room: room.trim().toUpperCase(),
      });
      toast.success(`Welcome to HostelHub, ${updated.name.split(' ')[0]}! 🚀`);
      navigate('/student', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayName = user?.email ? user.email : user?.name || 'Student';

  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-x-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-24 -right-24 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] rounded-full blur-[130px] opacity-25"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -left-32 w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] rounded-full blur-[140px] opacity-20"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-20 right-1/4 w-[360px] h-[360px] rounded-full blur-[140px] opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 flex-1 flex flex-col justify-center">
        
        {/* Top Header Bar */}
        <header className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img
              src="/logo.png"
              alt="HostelHub Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0"
            />
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight leading-none text-[var(--text-heading)]">
                Hostel<span style={{ color: '#f97316' }}>Hub</span>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] font-medium tracking-wide mt-1">
                Student Residence Portal
              </p>
            </div>
          </div>

          {/* Motivational Slogan with Orange Swoop */}
          <div className="text-right shrink-0">
            <p className="text-xs sm:text-sm text-[var(--text-primary)] font-semibold italic tracking-tight leading-tight">
              Same Hostel.
              <br />
              A Brighter Tomorrow.
            </p>
            <OrangeSwoop className="w-16 sm:w-20 mt-1 ml-auto" />
          </div>
        </header>

        {/* Content Section: responsive 1-column on mobile, 2-column on desktop */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 xl:gap-14 lg:items-center">
          
          {/* Desktop Left / Mobile Top Welcome Area */}
          <div className="lg:col-span-6 xl:col-span-7 mb-6 lg:mb-0 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-heading)] tracking-tight leading-tight mb-2 sm:mb-3">
              Let’s Get You{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Started
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm sm:max-w-md mx-auto lg:mx-0 mb-6 lg:mb-8">
              Tell us a few details to set up your account and access your hostel dashboard.
            </p>

            {/* Desktop Only: Feature Highlights visible on larger screens */}
            <div className="hidden lg:grid grid-cols-3 gap-3.5 mb-8">
              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] backdrop-blur-sm shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-2.5">
                  <Wrench className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-bold text-[var(--text-heading)] mb-0.5">Report Issues</h2>
                <p className="text-[11px] text-[var(--text-muted)] leading-tight">Raise requests easily</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] backdrop-blur-sm shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-2.5">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-bold text-[var(--text-heading)] mb-0.5">Track Status</h2>
                <p className="text-[11px] text-[var(--text-muted)] leading-tight">Stay updated</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] backdrop-blur-sm shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-2.5">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-bold text-[var(--text-heading)] mb-0.5">Rate Mess Food</h2>
                <p className="text-[11px] text-[var(--text-muted)] leading-tight">Share your feedback</p>
              </div>
            </div>

            {/* Desktop Ambient building banner */}
            <div className="hidden lg:block relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-xl">
              <img
                src="/onboarding-building-only.png"
                alt="Hostel Night Residence"
                className="w-full h-auto object-cover opacity-80 select-none pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent" />
            </div>
          </div>

          {/* Right Column / Mobile Center: Profile Setup Card */}
          <div className="lg:col-span-6 xl:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            <div
              className="rounded-[24px] p-5 sm:p-7 shadow-2xl transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-300 text-xs font-semibold mb-3.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                First-time Setup
              </div>

              {/* Title & Description */}
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-heading)] mb-1.5">
                Complete Your Profile
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-5 sm:mb-6">
                Please provide your name, select your hostel, and enter your room number to get started.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Field 1: Full Name */}
                <div>
                  <label
                    htmlFor="onboarding-name-input"
                    className="block text-xs sm:text-sm font-semibold text-[var(--text-heading)] mb-1.5"
                  >
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-[18px] h-[18px] text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="onboarding-name-input"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Arjun Sharma"
                      required
                      className="w-full h-[52px] pl-11 pr-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] placeholder-[var(--text-muted)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all hover:border-[var(--border-color)]"
                    />
                  </div>
                </div>

                {/* Field 2: Select Hostel */}
                <div>
                  <label
                    htmlFor="onboarding-hostel-select"
                    className="block text-xs sm:text-sm font-semibold text-[var(--text-heading)] mb-1.5"
                  >
                    Select Hostel <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-[18px] h-[18px] text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="onboarding-hostel-select"
                      value={hostel}
                      onChange={e => setHostel(e.target.value)}
                      required
                      className="w-full h-[52px] pl-11 pr-10 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all hover:border-[var(--border-color)] appearance-none cursor-pointer"
                    >
                      {HOSTEL_OPTIONS.map(opt => (
                        <option key={opt} value={opt} className="bg-[var(--bg-card)] text-[var(--text-primary)] py-2">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[var(--text-muted)] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Field 3: Room Number */}
                <div>
                  <label
                    htmlFor="onboarding-room-input"
                    className="block text-xs sm:text-sm font-semibold text-[var(--text-heading)] mb-1.5"
                  >
                    Room Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <BedDouble className="w-[18px] h-[18px] text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="onboarding-room-input"
                      type="text"
                      value={room}
                      onChange={e => setRoom(e.target.value)}
                      placeholder="E.G. B-204, 102"
                      required
                      className="w-full h-[52px] pl-11 pr-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] placeholder-[var(--text-muted)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all hover:border-[var(--border-color)] uppercase"
                    />
                  </div>
                </div>

                {/* Submit CTA Button */}
                <button
                  id="onboarding-submit-btn"
                  type="submit"
                  disabled={loading || !name.trim() || !room.trim()}
                  className="w-full h-[52px] mt-2 rounded-xl bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#7c3aed] hover:from-[#1d4ed8] hover:to-[#6d28d9] active:scale-[0.98] text-white font-bold text-sm sm:text-base tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Complete Setup &amp; Enter Dashboard
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Signed-in Account Info & Sign Out */}
              <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)] truncate pr-2 max-w-[210px] sm:max-w-[260px]">
                  Signed in as: <strong className="text-[var(--text-heading)] font-medium">{displayName}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-400 font-semibold transition-colors shrink-0 py-1 px-1.5 rounded-lg hover:bg-rose-500/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Only Feature Highlights Section (below card, matching reference design) */}
        <div className="lg:hidden mt-7">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 dark:text-blue-400 mb-2 shadow-sm shadow-blue-500/15">
                <Wrench className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[var(--text-heading)] leading-tight">Report Issues</p>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">Raise requests easily</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-2 shadow-sm shadow-emerald-500/15">
                <BarChart3 className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[var(--text-heading)] leading-tight">Track Status</p>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">Stay updated</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-2 shadow-sm shadow-amber-500/15">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[var(--text-heading)] leading-tight">Rate Mess Food</p>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">Share your feedback</p>
            </div>
          </div>

          {/* Mobile Bottom Ambient Hostel Night Building Illustration */}
          <div className="relative w-full max-w-md mx-auto mt-5 overflow-hidden rounded-2xl border border-white/[0.05] shadow-lg shadow-indigo-950/50">
            <div className="w-full relative overflow-hidden">
              <img
                src="/onboarding-building-only.png"
                alt="Hostel Night Residence"
                className="w-full h-auto object-cover opacity-85 select-none pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-[var(--bg-primary)]/50" />
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 px-4 border-t border-[var(--border-subtle)]">
        <p className="text-slate-500 text-[11px] font-medium tracking-wide">
          &copy; 2026 HostelHub &middot; MCS Hostel Management
        </p>
      </footer>
    </div>
  );
}
