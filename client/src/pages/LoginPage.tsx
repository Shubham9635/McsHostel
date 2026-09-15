import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Building2,
  Mail,
  RefreshCw,
  CheckCircle2,
  Edit3,
  AlertCircle,
  Inbox,
  ArrowRight,
  User as UserIcon,
  DoorClosed,
  CheckCheck,
  ChevronRight,
  Wrench,
  BarChart3,
  UtensilsCrossed,
  Lock,
  Zap,
  ShieldCheck,
} from 'lucide-react';

const HOSTEL_OPTIONS = [
  'New Girls Hostel',
  'Old Girls Hostel',
  'New Boys Hostel',
  'Old Boys Hostel',
  'Technova',
] as const;

function BuildingIllustration() {
  return (
    <svg viewBox="0 0 220 155" xmlns="http://www.w3.org/2000/svg" className="w-52 h-auto">
      <circle cx="80" cy="82" r="68" fill="#1e1b6e" opacity="0.65" />
      <circle cx="157" cy="22" r="9" fill="#2a277e" opacity="0.55" />
      <circle cx="172" cy="34" r="5.5" fill="#2a277e" opacity="0.4" />
      <rect x="18" y="24" width="70" height="108" rx="5" fill="#4338ca" />
      <rect x="18" y="20" width="70" height="7" rx="3" fill="#4f46e5" />
      <rect x="44" y="10" width="20" height="12" rx="3" fill="#3730a3" />
      <rect x="49" y="7" width="2.5" height="5" fill="#312e81" />
      <rect x="58" y="7" width="2.5" height="5" fill="#312e81" />
      <rect x="26" y="34" width="20" height="14" rx="2.5" fill="#fb923c" opacity="0.9" />
      <rect x="52" y="34" width="20" height="14" rx="2.5" fill="#1e1b4b" opacity="0.9" />
      <rect x="26" y="54" width="20" height="14" rx="2.5" fill="#1e1b4b" opacity="0.9" />
      <rect x="52" y="54" width="20" height="14" rx="2.5" fill="#fb923c" opacity="0.75" />
      <rect x="26" y="74" width="20" height="14" rx="2.5" fill="#fb923c" opacity="0.85" />
      <rect x="52" y="74" width="20" height="14" rx="2.5" fill="#fb923c" opacity="0.6" />
      <rect x="26" y="94" width="20" height="14" rx="2.5" fill="#1e1b4b" opacity="0.9" />
      <rect x="52" y="94" width="20" height="14" rx="2.5" fill="#1e1b4b" opacity="0.9" />
      <rect x="33" y="108" width="24" height="24" rx="3" fill="#1e1b4b" />
      <circle cx="54" cy="120" r="2" fill="#818cf8" />
      <ellipse cx="53" cy="135" rx="40" ry="4" fill="#1e1b4b" opacity="0.3" />
      <circle cx="122" cy="93" r="11" fill="#818cf8" />
      <ellipse cx="122" cy="85" rx="11" ry="5.5" fill="#6366f1" />
      <rect x="113" y="104" width="18" height="24" rx="5" fill="#6366f1" />
      <rect x="129" y="106" width="10" height="18" rx="3.5" fill="#4f46e5" />
      <rect x="113" y="126" width="8" height="11" rx="3.5" fill="#4f46e5" />
      <rect x="123" y="126" width="8" height="11" rx="3.5" fill="#4f46e5" />
      <ellipse cx="117" cy="136" rx="5" ry="2.5" fill="#3730a3" />
      <ellipse cx="127" cy="136" rx="5" ry="2.5" fill="#3730a3" />
      <ellipse cx="122" cy="138" rx="18" ry="3" fill="#1e1b4b" opacity="0.25" />
    </svg>
  );
}

function OrangeSwoop({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 10" className={className} fill="none">
      <path d="M3 7 Q36 1 69 7" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function CityscapeBottom() {
  return (
    <svg viewBox="0 0 390 110" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="xMidYMax slice">
      <ellipse cx="195" cy="120" rx="220" ry="70" fill="#1e1b6e" opacity="0.35" />
      <rect x="0"   y="48" width="48" height="62" rx="3" fill="#2d2a6e" opacity="0.7" />
      <rect x="12"  y="32" width="24" height="78" rx="2" fill="#3730a3" opacity="0.6" />
      <rect x="54"  y="20" width="60" height="90" rx="3" fill="#2d2a6e" opacity="0.65" />
      <rect x="66"  y="10" width="36" height="100" rx="2" fill="#3730a3" opacity="0.55" />
      <rect x="120" y="42" width="44" height="68" rx="3" fill="#2d2a6e" opacity="0.6" />
      <rect x="130" y="28" width="24" height="82" rx="2" fill="#3730a3" opacity="0.5" />
      <rect x="170" y="25" width="56" height="85" rx="3" fill="#2d2a6e" opacity="0.65" />
      <rect x="182" y="12" width="32" height="98" rx="2" fill="#3730a3" opacity="0.55" />
      <rect x="232" y="38" width="48" height="72" rx="3" fill="#2d2a6e" opacity="0.6" />
      <rect x="244" y="22" width="24" height="88" rx="2" fill="#3730a3" opacity="0.5" />
      <rect x="286" y="30" width="52" height="80" rx="3" fill="#2d2a6e" opacity="0.65" />
      <rect x="298" y="16" width="28" height="94" rx="2" fill="#3730a3" opacity="0.55" />
      <rect x="344" y="44" width="46" height="66" rx="3" fill="#2d2a6e" opacity="0.6" />
      <rect x="356" y="30" width="22" height="80" rx="2" fill="#3730a3" opacity="0.5" />
      <rect x="16"  y="42" width="8" height="6" rx="1" fill="#fb923c" opacity="0.4" />
      <rect x="16"  y="54" width="8" height="6" rx="1" fill="#fb923c" opacity="0.6" />
      <rect x="72"  y="22" width="10" height="7" rx="1" fill="#fb923c" opacity="0.35" />
      <rect x="86"  y="22" width="10" height="7" rx="1" fill="#fb923c" opacity="0.55" />
      <rect x="72"  y="36" width="10" height="7" rx="1" fill="#fb923c" opacity="0.5" />
      <rect x="186" y="18" width="10" height="7" rx="1" fill="#fb923c" opacity="0.45" />
      <rect x="200" y="18" width="10" height="7" rx="1" fill="#fb923c" opacity="0.3" />
      <rect x="186" y="32" width="10" height="7" rx="1" fill="#fb923c" opacity="0.55" />
      <rect x="303" y="26" width="10" height="7" rx="1" fill="#fb923c" opacity="0.4" />
      <rect x="303" y="40" width="10" height="7" rx="1" fill="#fb923c" opacity="0.6" />
      <rect x="362" y="38" width="8"  height="6" rx="1" fill="#fb923c" opacity="0.5" />
      <rect x="0" y="108" width="390" height="2" fill="#3730a3" opacity="0.3" />
    </svg>
  );
}

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export default function LoginPage() {
  const { sendOtp, verifyOtp, updateProfile, directLogin, googleLogin, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [emailError, setEmailError]   = useState<string | null>(null);
  const [otpStep, setOtpStep]         = useState<'email' | 'verify' | 'profile'>('email');
  const [otpDigits, setOtpDigits]     = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [name, setName]               = useState('');
  const [hostel, setHostel]           = useState<string>(HOSTEL_OPTIONS[0]);
  const [room, setRoom]               = useState('');
  const masterOtpInputRef             = useRef<HTMLInputElement | null>(null);
  const [isOtpFocused, setIsOtpFocused] = useState(false);

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) { setEmailError('Email address is required.'); return false; }
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!re.test(trimmed)) {
      setEmailError('Please enter a valid email address (e.g. yourname@gmail.com).');
      return false;
    }
    setEmailError(null);
    return true;
  };

  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    if (resendTimer > 0) t = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  const handleGoogleLogin = async (e?: React.FormEvent, directEmail?: string) => {
    if (e) e.preventDefault();
    const targetEmail = (directEmail || email).trim();
    if (!targetEmail) {
      setEmailError('Please enter your Gmail address (e.g. yourname@gmail.com).');
      const inputEl = document.getElementById('otp-email-input');
      inputEl?.focus();
      return;
    }
    if (!validateEmail(targetEmail)) {
      toast.error('Please enter a valid Gmail or email address');
      return;
    }

    setLoading(true);
    setEmailError(null);
    try {
      const { user: loggedInUser, is_new_user } = await googleLogin(targetEmail);
      if (loggedInUser.role === 'admin') {
        toast.success(`Welcome to Admin Panel, ${loggedInUser.name.split(' ')[0]}!`);
        navigate('/admin', { replace: true });
        return;
      }
      if (is_new_user || !loggedInUser.hostel || !loggedInUser.room) {
        toast.success('Welcome to HostelHub! Please complete your hostel details');
        navigate('/onboarding', { replace: true });
        return;
      }
      toast.success(`Welcome back, ${loggedInUser.name.split(' ')[0]}!`);
      navigate('/student', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Google login failed. Please try again.';
      setEmailError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setLoading(true);
    setEmailError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google OAuth initialization error:', err);
      const msg =
        err?.message?.includes('Unsupported provider') || err?.error_description?.includes('not enabled')
          ? 'Google sign-in is being connected. Please enable Google provider in your Supabase Auth dashboard or use Email Login / Direct Access.'
          : err?.message || 'Failed to initialize Google sign-in. Please try again.';
      toast.error(msg, { duration: 6000 });
      setLoading(false);
    }
  };

  const handleDirectLogin = async (targetEmail: string) => {
    setLoading(true);
    setEmailError(null);
    try {
      const { user: loggedInUser } = await directLogin(targetEmail);
      if (loggedInUser.role === 'admin') {
        toast.success(`Welcome to Admin Panel, ${loggedInUser.name.split(' ')[0]}!`);
        navigate('/admin', { replace: true });
      } else {
        toast.success(`Welcome back, ${loggedInUser.name.split(' ')[0]}!`);
        navigate('/student', { replace: true });
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Direct login failed.';
      setEmailError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent, overrideEmail?: string) => {
    if (e) e.preventDefault();
    const target = (overrideEmail || email).trim();
    if (!validateEmail(target)) { toast.error('Please enter a valid email address'); return; }

    const normalized = target.toLowerCase();
    // Direct login without OTP for student@hostel.hub and admin@hostel.hub
    if (normalized === 'student@hostel.hub' || normalized === 'admin@hostel.hub') {
      await handleDirectLogin(normalized);
      return;
    }

    setLoading(true);
    try {
      await sendOtp(target);
      setEmail(target);
      setOtpStep('verify');
      setResendTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
      toast.success(`Verification code sent to ${target}! Check your inbox`, { duration: 5000 });
      setTimeout(() => masterOtpInputRef.current?.focus(), 100);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to send verification code.';
      setEmailError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleMasterOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
    const d = ['', '', '', '', '', ''];
    for (let j = 0; j < digitsOnly.length; j++) {
      d[j] = digitsOnly[j];
    }
    setOtpDigits(d);
  };

  const handleBoxClick = () => {
    if (masterOtpInputRef.current) {
      masterOtpInputRef.current.focus();
      const len = otpDigits.filter(Boolean).length;
      masterOtpInputRef.current.setSelectionRange(len, len);
    }
  };

  const handleMasterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && otpDigits.filter(Boolean).length === 6) {
      e.preventDefault();
      handleVerifyOtp(e);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) { toast.error('Please enter the complete 6-digit code.'); return; }
    setLoading(true);
    try {
      const { user, is_new_user } = await verifyOtp(email.trim(), otp);
      if (user.role === 'admin') {
        toast.success(`Welcome to Admin Panel, ${user.name.split(' ')[0]}!`);
        navigate('/admin', { replace: true }); return;
      }
      if (is_new_user || !user.hostel || !user.room) {
        toast.success('Email verified! Please complete your hostel details');
        navigate('/onboarding', { replace: true }); return;
      }
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/student', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid code. Please check your inbox.');
    } finally { setLoading(false); }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Please enter your full name'); return; }
    if (!hostel) { toast.error('Please select your hostel'); return; }
    if (!room.trim()) { toast.error('Please enter your room number'); return; }
    setLoading(true);
    try {
      const updated = await updateProfile({ name: name.trim(), hostel, room: room.trim().toUpperCase() });
      toast.success(`Welcome to HostelHub, ${updated.name.split(' ')[0]}!`);
      navigate('/student', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save profile. Please try again.');
    } finally { setLoading(false); }
  };

  const goBack = () => { setOtpStep('email'); setOtpDigits(['', '', '', '', '', '']); setEmailError(null); };

  // ── Input class helpers ────────────────────────────────────────────────────
  const inputBase = 'w-full h-[52px] pl-[46px] pr-4 rounded-2xl text-[var(--input-text)] placeholder-[var(--text-muted)] text-sm font-medium focus:outline-none focus:ring-2 transition-all duration-200';
  const inputDefault = 'bg-[var(--input-bg)] border border-[var(--border-input)] hover:border-[var(--border-color)] focus:ring-indigo-500/40 focus:border-indigo-500/50';
  const inputError = 'bg-red-500/10 border border-red-500/50 focus:ring-red-500/30';
  const btnPrimary = 'w-full h-[52px] rounded-2xl bg-indigo-500 hover:bg-indigo-400 active:scale-[0.98] text-white font-bold text-base tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/25 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400';
  const btnGreen = 'w-full h-[52px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400';

  const Spinner = () => <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;

  // ── Render helpers (functions, not components, so DOM state and focus are never lost) ──
  const renderEmailForm = () => (
    <form onSubmit={handleSendOtp} noValidate className="space-y-3.5">
      <div>
        <label htmlFor="otp-email-input" className="block text-sm font-bold text-[var(--text-heading)] mb-2">College Email</label>
        <div className="relative">
          <Mail className="w-[18px] h-[18px] text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="otp-email-input" type="email" value={email} autoFocus autoComplete="email"
            placeholder="Enter your college or Gmail address"
            onChange={e => { setEmail(e.target.value); if (emailError) validateEmail(e.target.value); }}
            className={`${inputBase} ${emailError ? inputError : inputDefault}`}
          />
        </div>
        {emailError && (
          <p className="flex items-center gap-1.5 mt-2 text-xs text-red-400 font-medium" role="alert">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />{emailError}
          </p>
        )}
      </div>

      <button id="send-code-btn" type="submit" disabled={loading || !email.trim()} className={btnPrimary}>
        {loading ? <Spinner /> : <>Continue with Email <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
      </button>
      <div className="flex items-start gap-2.5">
        <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">We'll send a secure 6-digit verification code to your email.</p>
      </div>

      {/* Subtle Divider */}
      <div className="relative flex items-center justify-center my-2.5">
        <div className="border-t border-[var(--border-color)] w-full" />
        <span className="bg-[var(--bg-card)] px-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          or
        </span>
        <div className="border-t border-[var(--border-color)] w-full" />
      </div>

      {/* Real Google OAuth Login */}
      <button
        id="continue-with-google-btn"
        type="button"
        onClick={handleGoogleOAuth}
        disabled={loading}
        className="w-full h-[52px] rounded-2xl bg-white hover:bg-slate-50 dark:bg-slate-900/80 dark:hover:bg-slate-900 active:scale-[0.98] text-slate-800 dark:text-slate-100 font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm border border-slate-200 dark:border-slate-800 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>

    </form>
  );

  const renderOtpForm = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-4">
      <div className="flex items-center justify-between px-3.5 py-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
        <div className="min-w-0 pr-3">
          <p className="text-[11px] text-[var(--text-muted)] mb-0.5">Code sent to</p>
          <p className="text-sm font-semibold text-[var(--text-heading)] truncate">{email}</p>
        </div>
        <button type="button" onClick={goBack} className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-400 font-semibold shrink-0 transition-colors py-1.5 px-2 rounded-lg hover:bg-indigo-500/10">
          <Edit3 className="w-3 h-3" />Change
        </button>
      </div>
      <div className="flex items-start gap-3 p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-xl">
        <Inbox className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Check your inbox and spam folder. Code expires in 10 minutes.</p>
      </div>
      <div>
        <label className="block text-xs font-bold text-[var(--text-heading)] uppercase tracking-widest mb-2.5 text-center">
          Verification Code
        </label>
        <div className="relative flex justify-between gap-1.5 sm:gap-2 cursor-pointer" onClick={handleBoxClick}>
          {/* Master Native Input: captures mobile virtual keyboard typing, auto-advances, backspaces & pastes natively */}
          <input
            ref={masterOtpInputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={6}
            value={otpDigits.join('')}
            onChange={handleMasterOtpChange}
            onFocus={() => setIsOtpFocused(true)}
            onBlur={() => setIsOtpFocused(false)}
            onKeyDown={handleMasterKeyDown}
            aria-label="6-digit Verification Code"
            className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer caret-transparent"
          />

          {/* 6 Visual Digit Boxes (100% Identical Design & Styling) */}
          {otpDigits.map((digit, idx) => {
            const currentLen = otpDigits.filter(Boolean).length;
            const isCurrentActive = isOtpFocused && (
              currentLen === idx || (idx === 5 && currentLen === 6)
            );

            return (
              <div
                key={idx}
                className={`flex-1 min-w-0 h-12 sm:h-14 flex items-center justify-center text-center text-xl sm:text-2xl font-black rounded-xl transition-all duration-150 select-none border ${
                  digit
                    ? 'border-indigo-500/80 bg-indigo-500/10 shadow-sm shadow-indigo-500/20 text-[var(--text-heading)]'
                    : isCurrentActive
                    ? 'border-indigo-500/80 bg-indigo-500/5 ring-2 ring-indigo-500/50 text-[var(--text-heading)]'
                    : 'border-[var(--border-input)] bg-[var(--input-bg)] text-[var(--text-heading)] hover:border-[var(--border-color)]'
                }`}
              >
                {digit ? (
                  digit
                ) : isCurrentActive ? (
                  <span className="inline-block w-0.5 h-6 sm:h-7 bg-indigo-500 rounded-full animate-pulse" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <button id="verify-code-btn" type="submit" disabled={loading || otpDigits.join('').length !== 6} className={btnGreen}>
        {loading ? <Spinner /> : <><CheckCircle2 className="w-4 h-4" />Verify &amp; Continue</>}
      </button>
      <div className="text-center">
        {resendTimer > 0
          ? <p className="text-xs text-slate-500">Resend in <span className="text-slate-300 font-semibold tabular-nums">{resendTimer}s</span></p>
          : <button type="button" onClick={() => handleSendOtp()} disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50">
              <RefreshCw className="w-3 h-3" />Resend verification code
            </button>
        }
      </div>
    </form>
  );

  const renderProfileForm = () => (
    <form onSubmit={handleProfileSubmit} className="space-y-4">
      <div>
        <label htmlFor="name-input" className="block text-sm font-bold text-[var(--text-heading)] mb-2">Full Name <span className="text-red-400">*</span></label>
        <div className="relative">
          <UserIcon className="w-[18px] h-[18px] text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input id="name-input" type="text" value={name} placeholder="e.g. Arjun Sharma" required
            onChange={e => setName(e.target.value)}
            className={`${inputBase} ${inputDefault}`} />
        </div>
      </div>
      <div>
        <label htmlFor="hostel-select" className="block text-sm font-bold text-[var(--text-heading)] mb-2">Hostel <span className="text-red-400">*</span></label>
        <div className="relative">
          <Building2 className="w-[18px] h-[18px] text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <select id="hostel-select" value={hostel} required onChange={e => setHostel(e.target.value)}
            className="w-full h-[52px] pl-[46px] pr-10 rounded-2xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--input-text)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all text-sm font-medium appearance-none cursor-pointer">
            {HOSTEL_OPTIONS.map(o => <option key={o} value={o} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{o}</option>)}
          </select>
          <ChevronRight className="w-4 h-4 text-[var(--text-muted)] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
        </div>
      </div>
      <div>
        <label htmlFor="room-input" className="block text-sm font-bold text-[var(--text-heading)] mb-2">Room Number <span className="text-red-400">*</span></label>
        <div className="relative">
          <DoorClosed className="w-[18px] h-[18px] text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input id="room-input" type="text" value={room} placeholder="e.g. B-204" required
            onChange={e => setRoom(e.target.value)}
            className={`${inputBase} ${inputDefault} uppercase`} />
        </div>
      </div>
      <button id="complete-profile-btn" type="submit" disabled={loading || !name.trim() || !room.trim()}
        className={`${btnPrimary} mt-1`}>
        {loading ? <Spinner /> : <>Complete Setup &amp; Enter Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>}
      </button>
    </form>
  );

  const stepTitle    = { email: 'Welcome back', verify: 'Check your inbox', profile: 'Complete your profile' }[otpStep];
  const stepSubtitle = {
    email:   'Sign in to continue to HostelHub',
    verify:  `We sent a 6-digit code to ${email}`,
    profile: 'Tell us about yourself to get started',
  }[otpStep];

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ══ MOBILE LAYOUT ══════════════════════════════════════════════════════ */}
      <div className="lg:hidden min-h-screen flex flex-col overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>

        {/* Fixed background blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(67,56,202,0.45) 0%, transparent 70%)' }} />
          <div className="absolute top-56 -left-24 w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }} />
          <div className="absolute bottom-32 -right-16 w-48 h-48 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(67,56,202,0.2) 0%, transparent 70%)' }} />
        </div>

        {/* ── EMAIL STEP ── */}
        {otpStep === 'email' && (
          <>
            {/* Hero */}
            <div className="relative px-5 pt-10 pb-5">
              {/* Top-right badge */}
              <div className="absolute top-10 right-5 text-right max-w-[100px]">
                <p className="text-[var(--text-secondary)] text-[11px] leading-[1.45] font-medium">A better<br />hostel life<br />starts here</p>
                <OrangeSwoop className="w-14 mt-1 ml-auto" />
              </div>
              <div className="mb-3">
                <img
                  src="/logo.png"
                  alt="HostelHub Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h1 className="text-[2.6rem] font-black text-[var(--text-heading)] leading-none mb-1.5 tracking-tight">
                Hostel<span style={{ color: '#f97316' }}>Hub</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-[15px] font-medium">Connect. Report. Improve.</p>
              {/* Feature icons */}
              <div className="flex gap-3 mt-6">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#2d2f9a' }}>
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-[var(--text-primary)] text-[11px] font-semibold text-center leading-tight">Report<br />Issues Easily</p>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#1a5c3a' }}>
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-[var(--text-primary)] text-[11px] font-semibold text-center leading-tight">Track<br />in Real Time</p>
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#5c3010' }}>
                    <UtensilsCrossed className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-[var(--text-primary)] text-[11px] font-semibold text-center leading-tight">Rate<br />Mess Food</p>
                </div>
              </div>
            </div>

            {/* Login card */}
            <div className="mx-4 rounded-[22px] p-5 shadow-2xl"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <h2 className="text-2xl font-black text-[var(--text-heading)] mb-1">Welcome back 👋</h2>
              <p className="text-[var(--text-secondary)] text-sm mb-5">Sign in to continue to HostelHub</p>
              {renderEmailForm()}
            </div>

            {/* Bottom cityscape */}
            <div className="mt-auto">
              <div className="px-6 pt-8 pb-2">
                <p className="text-white/55 text-base italic font-semibold leading-snug">Same Hostel.<br />A Better Tomorrow.</p>
                <OrangeSwoop className="w-20 mt-1.5" />
              </div>
              <CityscapeBottom />
            </div>
            <div className="text-center py-3 pb-5">
              <p className="text-slate-600 text-[11px]">&#169; 2026 HostelHub &middot; MCS Hostel Management</p>
            </div>
          </>
        )}

        {/* ── OTP STEP ── */}
        {otpStep === 'verify' && (
          <div className="flex flex-col min-h-screen">
            <div className="flex items-center gap-2.5 px-5 pt-10 pb-6">
              <img
                src="/logo.png"
                alt="HostelHub Logo"
                className="w-8 h-8 object-contain shrink-0"
              />
              <span className="text-[var(--text-heading)] font-black text-lg">Hostel<span style={{ color: '#f97316' }}>Hub</span></span>
            </div>
            <div className="flex-1 px-5 pt-2 pb-8">
              <div className="flex items-center gap-1.5 mb-6">
                <button type="button" onClick={goBack} className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold transition-colors">Sign in</button>
                <ChevronRight className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-[var(--text-muted)] font-medium">Verify code</span>
              </div>
              <h2 className="text-2xl font-black text-[var(--text-heading)] mb-1">{stepTitle}</h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">{stepSubtitle}</p>
              {renderOtpForm()}
            </div>
            <div className="text-center py-4">
              <p className="text-slate-500 text-[11px]">&#169; 2026 HostelHub &middot; MCS Hostel Management</p>
            </div>
          </div>
        )}

        {/* ── PROFILE STEP ── */}
        {otpStep === 'profile' && (
          <div className="flex flex-col min-h-screen">
            <div className="flex items-center gap-2.5 px-5 pt-10 pb-6">
              <img
                src="/logo.png"
                alt="HostelHub Logo"
                className="w-8 h-8 object-contain shrink-0"
              />
              <span className="text-[var(--text-heading)] font-black text-lg">Hostel<span style={{ color: '#f97316' }}>Hub</span></span>
            </div>
            <div className="flex-1 px-5 pt-2 pb-8">
              <h2 className="text-2xl font-black text-[var(--text-heading)] mb-1">{stepTitle}</h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">{stepSubtitle}</p>
              {renderProfileForm()}
            </div>
            <div className="text-center py-4">
              <p className="text-slate-500 text-[11px]">&#169; 2026 HostelHub &middot; MCS Hostel Management</p>
            </div>
          </div>
        )}
      </div>

      {/* ══ DESKTOP LAYOUT ══════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>

        {/* Left branding panel */}
        <div className="lg:w-1/2 xl:w-[55%] relative flex flex-col p-12 xl:p-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1836] via-[#16143a] to-[#0f0e1a]" />
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(67,56,202,0.12) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="HostelHub Logo"
                className="w-12 h-12 object-contain shrink-0"
              />
              <span className="text-white font-black text-2xl tracking-tight">Hostel<span style={{ color: '#f97316' }}>Hub</span></span>
            </div>

            <div className="my-auto py-16">
              <p className="text-indigo-400 text-xs font-bold tracking-[0.2em] uppercase mb-6 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-indigo-500" />
                Connect. Report. Improve.
              </p>
              <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.15] mb-6">
                Hostel management<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400">made simple.</span>
              </h1>
              <p className="text-slate-400 text-base xl:text-lg leading-relaxed max-w-[420px] mb-10">
                One platform to report hostel issues, track solutions, and improve everyday hostel life.
              </p>
              <ul className="space-y-4">
                {[
                  { Icon: CheckCheck, text: 'Report hostel issues easily' },
                  { Icon: CheckCheck, text: 'Track complaints in real time' },
                  { Icon: CheckCheck, text: 'Rate and review mess food' },
                ].map(({ Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Icon className="w-3 h-3 text-indigo-400" />
                    </span>
                    <span className="text-slate-300 text-sm font-medium">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto opacity-[0.18]"><CityscapeBottom /></div>
          </div>
        </div>

        {/* Right login panel */}
        <div className="flex-1 lg:w-1/2 xl:w-[45%] flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="flex-1 flex flex-col justify-center px-8 lg:px-10 xl:px-14 py-12">
            <div className="mb-8">
              {otpStep !== 'email' && (
                <div className="flex items-center gap-1.5 mb-4">
                  <button type="button" onClick={goBack} className="text-xs text-indigo-500 hover:text-indigo-400 font-semibold transition-colors">Sign in</button>
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-[var(--text-muted)] font-medium">{otpStep === 'verify' ? 'Verify code' : 'Setup profile'}</span>
                </div>
              )}
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-heading)] leading-tight mb-2">
                {stepTitle} {otpStep === 'email' && <span>👋</span>}
              </h2>
              <p className="text-[var(--text-secondary)] text-sm sm:text-base">{stepSubtitle}</p>
            </div>
            {otpStep === 'email'   && renderEmailForm()}
            {otpStep === 'verify'  && renderOtpForm()}
            {otpStep === 'profile' && renderProfileForm()}
          </div>
          <div className="px-8 lg:px-10 xl:px-14 py-5 border-t border-[var(--border-subtle)]">
            <p className="text-slate-500 text-[11px]">&#169; 2026 HostelHub &middot; MCS Hostel Management</p>
          </div>
        </div>
      </div>
    </>
  );
}
