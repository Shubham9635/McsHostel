import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────
export type ThemePreference = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

interface ThemeContextValue {
  /** The user's saved preference (dark | light | system) */
  preference: ThemePreference;
  /** The actual resolved theme being applied */
  resolved: ResolvedTheme;
  setTheme: (pref: ThemePreference) => void;
}

const STORAGE_KEY = 'hh-theme';

// ─── Context ───────────────────────────────────────────────────────────────────
const ThemeContext = createContext<ThemeContextValue>({
  preference: 'system',
  resolved: 'dark',
  setTheme: () => {},
});

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', resolved);
}

function getSavedPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
  } catch {}
  return 'system';
}

// ─── Provider ──────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(getSavedPreference);
  const [resolved, setResolved] = useState<ResolvedTheme>(() => {
    const pref = getSavedPreference();
    return pref === 'system' ? getSystemTheme() : pref;
  });

  // Apply resolved theme to DOM
  const resolveAndApply = useCallback((pref: ThemePreference) => {
    const r: ResolvedTheme = pref === 'system' ? getSystemTheme() : pref;
    setResolved(r);
    applyTheme(r);
  }, []);

  // When preference changes
  useEffect(() => {
    resolveAndApply(preference);
  }, [preference, resolveAndApply]);

  // Listen for system theme changes when preference is 'system'
  useEffect(() => {
    if (preference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => resolveAndApply('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference, resolveAndApply]);

  const setTheme = useCallback((pref: ThemePreference) => {
    setPreference(pref);
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ preference, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useTheme() {
  return useContext(ThemeContext);
}
