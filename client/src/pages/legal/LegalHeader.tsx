import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface LegalHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export default function LegalHeader({ title, subtitle, badge }: LegalHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { preference, setTheme, resolved } = useTheme();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(user?.role === 'admin' ? '/admin' : user ? '/student' : '/');
    }
  };

  const cycleTheme = () => {
    if (preference === 'system') setTheme('light');
    else if (preference === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-xl transition-colors"
      style={{
        background: 'var(--nav-bg)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Back button & brand */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 shrink-0"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div
            onClick={() => navigate(user?.role === 'admin' ? '/admin' : user ? '/student' : '/')}
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
          >
            <img
              src="/logo.png"
              alt="HostelHub"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <span className="font-black text-base sm:text-lg tracking-tight leading-none" style={{ color: 'var(--text-heading)' }}>
              Hostel<span style={{ color: '#f97316' }}>Hub</span>
            </span>
          </div>

          {badge && (
            <span
              className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{
                background: 'rgba(99, 102, 241, 0.12)',
                color: '#6366f1',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Right: Theme switcher pill & Home/Dashboard link */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={cycleTheme}
            className="px-2.5 py-1 sm:py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
            }}
            aria-label="Toggle theme appearance"
            title={`Current theme: ${preference} (Resolved: ${resolved})`}
          >
            {preference === 'system' ? (
              <Monitor className="w-3.5 h-3.5 text-indigo-500" />
            ) : resolved === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className="capitalize text-[11px] font-bold hidden xs:inline">{preference}</span>
          </button>

          {user && (
            <button
              type="button"
              onClick={() => navigate(user.role === 'admin' ? '/admin' : '/student')}
              className="px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-sm shadow-indigo-500/20"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              }}
            >
              {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
