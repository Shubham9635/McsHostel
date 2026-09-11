import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardList, UtensilsCrossed, ShieldAlert, Settings } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const navItems = [
  { path: '/student', label: 'Home', icon: Home, id: 'nav-home', exact: true },
  { path: '/student/complaints', label: 'Complaints', icon: ClipboardList, id: 'nav-complaints' },
  { path: '/student/mess', label: 'Mess', icon: UtensilsCrossed, id: 'nav-mess' },
  { path: '/student/safety', label: 'Report', icon: ShieldAlert, id: 'nav-safety' },
  { path: '/student/settings', label: 'Settings', icon: Settings, id: 'nav-settings' },
];

export default function StudentLayout() {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Page content — bottom padding accounts for nav bar */}
      <main className="pb-[76px]">
        <Outlet />
      </main>

      {/* ── Premium Bottom Navigation ─────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'var(--nav-bg)',
          borderTop: '1px solid var(--nav-border)',
          boxShadow: 'var(--shadow-nav)',
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
        }}
      >
        <div className="max-w-lg mx-auto grid grid-cols-5 h-[60px]">
          {navItems.map(item => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                id={item.id}
                className="flex flex-col items-center justify-center gap-0.5 relative transition-all duration-200"
              >
                {/* Active top glow line */}
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
                  />
                )}

                {/* Icon container */}
                <div className="relative flex items-center justify-center">
                  <div
                    className={`p-1.5 rounded-xl transition-all duration-200 ${
                      isActive ? 'bg-indigo-500/15' : ''
                    }`}
                  >
                    <Icon
                      className={`w-[22px] h-[22px] transition-all duration-200 ${
                        isActive ? 'stroke-[2.5px] text-indigo-400' : 'stroke-[1.7px] text-slate-500'
                      }`}
                    />
                  </div>
                  {/* Notification badge if applicable */}
                  {item.path.includes('notifications') && unreadCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-[16px] h-[16px] rounded-full flex items-center justify-center text-white font-bold"
                      style={{ fontSize: '9px', background: '#ef4444' }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[9.5px] sm:text-[10px] font-semibold leading-tight text-center px-0.5 transition-all duration-200 ${
                    isActive ? 'text-indigo-400' : 'text-slate-500'
                  }`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
