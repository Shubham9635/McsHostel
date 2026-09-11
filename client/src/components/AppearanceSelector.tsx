import React from 'react';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { useTheme, ThemePreference } from '../contexts/ThemeContext';

interface ThemeOption {
  id: ThemePreference;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'system',
    label: 'System',
    icon: Monitor,
  },
  {
    id: 'light',
    label: 'Light',
    icon: Sun,
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: Moon,
  },
];

export default function AppearanceSelector({ compact: _compact }: { compact?: boolean } = {}) {
  const { preference, resolved, setTheme } = useTheme();

  return (
    <div
      className="rounded-2xl p-3.5 sm:p-4 border transition-colors duration-200"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3
            className="text-sm sm:text-base font-bold tracking-tight leading-tight"
            style={{ color: 'var(--text-heading)' }}
          >
            Appearance
          </h3>
          <p className="text-[11px] sm:text-xs mt-0.5 leading-tight" style={{ color: 'var(--text-secondary)' }}>
            Choose how HostelHub looks to you
          </p>
        </div>
        <div
          className="px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 shrink-0"
          style={{
            background: resolved === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.10)',
            color: '#6366f1',
            border: '1px solid rgba(99, 102, 241, 0.25)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Active: <span className="capitalize font-bold">{resolved}</span>
        </div>
      </div>

      {/* Segmented 3-Option Theme Selector (Compact One-Row Layout) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {THEME_OPTIONS.map(option => {
          const isSelected = preference === option.id;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              id={`theme-opt-${option.id}`}
              onClick={() => setTheme(option.id)}
              className={`relative flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.97] select-none ${
                isSelected
                  ? 'border-indigo-400/40 text-white shadow-md'
                  : 'hover:border-indigo-500/40'
              }`}
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                  : 'var(--bg-secondary)',
                borderColor: isSelected ? 'rgba(129, 140, 248, 0.45)' : 'var(--border-color)',
                boxShadow: isSelected ? '0 4px 14px -2px rgba(79, 70, 229, 0.4)' : 'none',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
              }}
              aria-pressed={isSelected}
              aria-label={`Set appearance theme to ${option.label}`}
            >
              <Icon
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${
                  isSelected ? 'text-white' : 'text-[var(--text-secondary)]'
                }`}
              />
              <span className="truncate">{option.label}</span>
              {isSelected && (
                <Check className="w-3.5 h-3.5 stroke-[3] text-white shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Status Indicator */}
      <div
        className="mt-2.5 pt-2 border-t flex items-center text-[11px] sm:text-xs font-medium"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
      >
        <span className="flex items-center gap-1.5 truncate">
          {preference === 'system' ? (
            <>
              <span className="text-xs shrink-0">⚙️</span>
              <span className="truncate">
                Following your device &middot; Currently using{' '}
                <strong className="font-bold text-[var(--text-heading)]">
                  {resolved === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </strong>
              </span>
            </>
          ) : preference === 'light' ? (
            <>
              <span className="text-xs shrink-0">☀️</span>
              <span className="truncate">
                Light Mode active &middot; Clean and crisp daytime display
              </span>
            </>
          ) : (
            <>
              <span className="text-xs shrink-0">🌙</span>
              <span className="truncate">
                Dark Mode active &middot; Deep immersive low-light display
              </span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
