import { useState, useMemo } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Notification } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  CheckCheck,
  Wrench,
  ShieldAlert,
  UtensilsCrossed,
  Info,
  ChevronRight,
  Sparkles,
  Megaphone,
} from 'lucide-react';

type TabKey = 'all' | 'unread' | 'announcement' | 'complaint' | 'safety_report' | 'mess' | 'system';

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const filteredNotifications = useMemo(() => {
    const list = notifications.filter((n) => {
      const rel = n.related_type || (n.type === 'complaint' ? 'complaint' : n.type === 'mess' ? 'mess' : n.type === 'announcement' ? 'announcement' : 'system');
      const isUnread = !n.read && !n.is_read;

      if (activeTab === 'unread') return isUnread;
      if (activeTab === 'announcement') return rel === 'announcement' || n.type === 'announcement';
      if (activeTab === 'complaint') return rel === 'complaint';
      if (activeTab === 'safety_report') return rel === 'safety_report';
      if (activeTab === 'mess') return rel === 'mess';
      if (activeTab === 'system') return rel === 'system';
      return true;
    });

    // Sort: Urgent unread alerts float to top, followed by newest
    return list.sort((a, b) => {
      const aIsUrgentUnread = (!a.read && !a.is_read) && (a.priority === 'urgent' || a.title.includes('URGENT') || a.title.includes('🔴'));
      const bIsUrgentUnread = (!b.read && !b.is_read) && (b.priority === 'urgent' || b.title.includes('URGENT') || b.title.includes('🔴'));
      if (aIsUrgentUnread && !bIsUrgentUnread) return -1;
      if (!aIsUrgentUnread && bIsUrgentUnread) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [notifications, activeTab]);

  const announcementCount = useMemo(() => {
    return notifications.filter((n) => n.related_type === 'announcement' || n.type === 'announcement').length;
  }, [notifications]);

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'announcement', label: '📢 Notices', count: announcementCount },
    { key: 'complaint', label: 'Complaints' },
    { key: 'safety_report', label: 'Safety' },
    { key: 'mess', label: 'Mess' },
    { key: 'system', label: 'System' },
  ];

  const getIcon = (notif: Notification) => {
    const rel = notif.related_type || (notif.type === 'complaint' ? 'complaint' : notif.type === 'mess' ? 'mess' : notif.type === 'announcement' ? 'announcement' : 'system');
    if (rel === 'announcement' || notif.type === 'announcement') {
      return <Megaphone className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
    }
    if (rel === 'complaint') {
      return <Wrench className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
    }
    if (rel === 'safety_report') {
      return <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
    }
    if (rel === 'mess') {
      return <UtensilsCrossed className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
    }
    return <Info className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-28">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
              Notifications
            </h1>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount === 1 ? '' : 's'}` : 'You are all caught up!'}
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              id="mark-all-read-btn"
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-all px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 active:scale-95 shadow-sm"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* ── Filter Tabs ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-1.5 active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md shadow-indigo-500/20'
                    : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
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

        {/* ── Notifications Feed / Loading / Empty ─────────────────────────── */}
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl animate-pulse border"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                }}
              />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center border mt-3"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-500 dark:text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text-heading)' }}>
              No notifications
            </h3>
            <p className="text-xs max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
              {activeTab === 'unread'
                ? "You've read all your notifications!"
                : "You don't have any notifications in this category."}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredNotifications.map((notif) => {
              const isUnread = !notif.read && !notif.is_read;
              const isUrgent =
                notif.priority === 'urgent' ||
                notif.title.includes('URGENT') ||
                notif.title.includes('🔴');

              return (
                <div
                  key={notif.id}
                  id={`notif-${notif.id}`}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 cursor-pointer active:scale-[0.99] flex items-start gap-3.5 ${
                    isUnread
                      ? 'border-indigo-500/40 shadow-md shadow-indigo-500/5'
                      : 'hover:border-[var(--border-color)]'
                  }`}
                  style={{
                    background: isUnread ? 'var(--bg-elevated)' : 'var(--bg-card)',
                    borderColor: isUnread ? undefined : 'var(--border-color)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isUrgent
                        ? 'bg-rose-500/15 border-rose-500/30'
                        : 'bg-[var(--bg-primary)] border-[var(--border-subtle)]'
                    }`}
                  >
                    {getIcon(notif)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`font-bold text-xs sm:text-sm leading-snug truncate ${
                          isUnread ? 'text-[var(--text-heading)]' : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {notif.title}
                      </p>
                      {isUnread && (
                        <span className="shrink-0 w-2.5 h-2.5 bg-indigo-500 rounded-full mt-1 animate-pulse" />
                      )}
                    </div>

                    <p
                      className="text-xs mt-1 line-clamp-2 leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                      <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                      </p>

                      <span className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 flex items-center gap-0.5">
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
