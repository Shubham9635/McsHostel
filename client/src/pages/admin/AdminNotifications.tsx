import { useState, useMemo } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Notification } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  CheckCheck,
  Wrench,
  UtensilsCrossed,
  Info,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

type TabKey = 'all' | 'unread' | 'complaint' | 'safety_report' | 'mess' | 'system';

export default function AdminNotifications() {
  const {
    notifications,
    unreadCount,
    loading,
    markAllAsRead,
    handleNotificationClick,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const rel = n.related_type || (n.type === 'complaint' ? 'complaint' : n.type === 'mess' ? 'mess' : 'system');
      const isUnread = !n.read && !n.is_read;

      if (activeTab === 'unread') return isUnread;
      if (activeTab === 'complaint') return rel === 'complaint';
      if (activeTab === 'safety_report') return rel === 'safety_report';
      if (activeTab === 'mess') return rel === 'mess';
      if (activeTab === 'system') return rel === 'system' || n.type === 'announcement';
      return true;
    });
  }, [notifications, activeTab]);

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'complaint', label: 'Complaints' },
    { key: 'safety_report', label: 'Safety Reports' },
    { key: 'mess', label: 'Mess Feedback' },
    { key: 'system', label: 'System' },
  ];

  const getIcon = (notif: Notification) => {
    const rel = notif.related_type || (notif.type === 'complaint' ? 'complaint' : notif.type === 'mess' ? 'mess' : 'system');
    if (rel === 'safety_report') {
      return <ShieldAlert className="w-5 h-5 text-rose-500 dark:text-rose-400" />;
    }
    if (rel === 'complaint') {
      return <Wrench className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
    }
    if (rel === 'mess') {
      return <UtensilsCrossed className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
    }
    return <Info className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-heading)] tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
              <Bell className="w-6 h-6" />
            </span>
            System Alerts &amp; Notifications
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Real-time complaint dispatches, anti-ragging incident reports, and mess feedback
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold text-xs transition-all active:scale-95 self-start sm:self-auto shadow-sm"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* ── Filter Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/20'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Notifications List ────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl animate-pulse border"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
              }}
            />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div
          className="rounded-3xl p-12 text-center border mt-4"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-500 dark:text-indigo-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-heading)] mb-1">
            No Notifications
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            {activeTab !== 'all'
              ? 'No alerts match this filter.'
              : 'You are all caught up! No recent system alerts.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const isUnread = !n.read && !n.is_read;
            const isUrgent =
              n.priority === 'urgent' ||
              n.title.includes('URGENT') ||
              n.title.includes('🔴');

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] flex items-start gap-4 ${
                  isUnread
                    ? 'border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                    : 'hover:border-[var(--border-color)]'
                }`}
                style={{
                  background: isUnread ? 'var(--bg-elevated)' : 'var(--bg-card)',
                  borderColor: isUnread ? undefined : 'var(--border-color)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isUrgent
                      ? 'bg-rose-500/15 border-rose-500/30'
                      : 'bg-[var(--bg-primary)] border-[var(--border-subtle)]'
                  }`}
                >
                  {getIcon(n)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3
                      className={`text-sm sm:text-base font-bold truncate ${
                        isUnread
                          ? 'text-[var(--text-heading)]'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {n.title}
                    </h3>

                    <div className="flex items-center gap-2 shrink-0">
                      {isUnread && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white">
                          New
                        </span>
                      )}
                      <span className="text-xs font-medium text-[var(--text-muted)]">
                        {formatDistanceToNow(new Date(n.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <p
                    className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2"
                  >
                    {n.message}
                  </p>

                  <div
                    className="flex items-center justify-between mt-3 pt-2.5 border-t"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <span className="text-[11px] font-medium text-[var(--text-muted)] capitalize">
                      Category: {n.related_type?.replace('_', ' ') || n.type}
                    </span>

                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <span>Open Item</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
