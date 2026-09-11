import React, { useEffect, useState } from 'react';
import { notificationsApi } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';
import {
  Bell,
  Wrench,
  ShieldAlert,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  Lock,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationSettingsCardProps {
  role: 'student' | 'admin';
}

export default function NotificationSettingsCard({ role }: NotificationSettingsCardProps) {
  const { soundEnabled, setSoundEnabled } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    complaints: true,
    safety: true,
    mess: true,
    system: true,
    sound: false,
  });

  useEffect(() => {
    notificationsApi
      .getSettings()
      .then((res) => {
        setSettings((prev) => ({
          ...prev,
          ...res.data,
          sound: soundEnabled,
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [soundEnabled]);

  const toggle = async (key: 'complaints' | 'safety' | 'mess' | 'system' | 'sound') => {
    if (key === 'safety' && role === 'admin') {
      toast('Critical safety & anti-ragging alerts cannot be disabled for administrators.', {
        icon: '🛡️',
      });
      return;
    }

    if (key === 'sound') {
      const nextVal = !soundEnabled;
      setSoundEnabled(nextVal);
      setSettings((prev) => ({ ...prev, sound: nextVal }));
      toast.success(nextVal ? 'Sound alerts enabled 🔔' : 'Sound alerts muted 🔕');
      return;
    }

    const nextVal = !settings[key];
    const updated = { ...settings, [key]: nextVal };
    setSettings(updated);

    try {
      await notificationsApi.updateSettings(updated);
      toast.success('Notification preferences updated');
    } catch {
      toast.error('Failed to update preferences');
      setSettings(settings); // Revert on failure
    }
  };

  if (loading) {
    return (
      <div
        className="rounded-2xl p-5 border flex items-center justify-center gap-2 text-xs"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-muted)',
        }}
      >
        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
        <span>Loading preferences...</span>
      </div>
    );
  }

  const items = [
    {
      key: 'complaints' as const,
      label: role === 'admin' ? 'New Complaints & Assignments' : 'Complaint Status Updates',
      desc: role === 'admin' ? 'Get alerted when students submit maintenance tickets' : 'Instant updates on repair progress & technician assignments',
      icon: Wrench,
      color: 'text-blue-500 dark:text-blue-400',
      enabled: settings.complaints,
      locked: false,
    },
    {
      key: 'safety' as const,
      label: role === 'admin' ? 'Safety & Anti-Ragging Alerts' : 'Safety Report Status Alerts',
      desc:
        role === 'admin'
          ? 'Mandatory emergency and campus anti-ragging notifications'
          : 'Updates on your submitted safety reports and anti-ragging notices',
      icon: ShieldAlert,
      color: 'text-rose-500 dark:text-rose-400',
      enabled: role === 'admin' ? true : settings.safety,
      locked: role === 'admin',
    },
    {
      key: 'mess' as const,
      label: role === 'admin' ? 'Mess Feedback & Meal Reviews' : 'Mess Menu & Meal Announcements',
      desc: role === 'admin' ? 'Notifications when students submit ratings for meals' : 'Daily menu alerts and meal schedule updates',
      icon: UtensilsCrossed,
      color: 'text-purple-500 dark:text-purple-400',
      enabled: settings.mess,
      locked: false,
    },
    {
      key: 'system' as const,
      label: 'System Announcements',
      desc: 'Important hostel administration alerts and maintenance notices',
      icon: Bell,
      color: 'text-indigo-500 dark:text-indigo-400',
      enabled: settings.system,
      locked: false,
    },
    {
      key: 'sound' as const,
      label: 'Notification Sound',
      desc: 'Play a subtle audio tone when a real-time notification arrives',
      icon: soundEnabled ? Volume2 : VolumeX,
      color: 'text-amber-500 dark:text-amber-400',
      enabled: soundEnabled,
      locked: false,
    },
  ];

  return (
    <div
      className="rounded-2xl p-3.5 sm:p-4 border space-y-2"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[var(--text-heading)] leading-tight">
            Notification Preferences
          </h3>
          <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5 leading-tight">
            Configure real-time delivery channels and alert categories
          </p>
        </div>
        <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
          <Bell className="w-3.5 h-3.5" />
        </span>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="py-2 sm:py-2.5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                  style={{
                    background: 'var(--bg-primary)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-[var(--text-heading)] truncate">
                      {item.label}
                    </p>
                    {item.locked && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                        <Lock className="w-2.5 h-2.5" /> Required
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] sm:text-[11px] text-[var(--text-muted)] leading-tight mt-0.5 truncate">
                    {item.desc}
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => toggle(item.key)}
                disabled={item.locked}
                aria-label={`Toggle ${item.label}`}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  item.enabled
                    ? 'bg-indigo-600'
                    : 'bg-slate-300 dark:bg-slate-700'
                } ${item.locked ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    item.enabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
