import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Wrench,
  ShieldAlert,
  UtensilsCrossed,
  CheckCheck,
  ArrowRight,
  Sparkles,
  Megaphone,
} from 'lucide-react';
import type { Notification } from '../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  viewAllPath: string;
}

export default function NotificationDropdown({
  isOpen,
  onClose,
  viewAllPath,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
  } = useNotifications();

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const recentList = notifications.slice(0, 6);

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
    return <Bell className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-fadeIn"
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)',
        boxShadow: '0 20px 35px -10px rgba(0,0,0,0.35)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[var(--text-heading)]">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors active:scale-95"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
        {recentList.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-2 text-indigo-500 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-[var(--text-heading)] mb-0.5">
              You're all caught up!
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              No new notifications right now.
            </p>
          </div>
        ) : (
          recentList.map((notif) => {
            const isUnread = !notif.read && !notif.is_read;
            const isUrgent = notif.priority === 'urgent' || notif.title.includes('URGENT') || notif.title.includes('🔴');

            return (
              <div
                key={notif.id}
                onClick={() => {
                  onClose();
                  handleNotificationClick(notif);
                }}
                className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-[var(--bg-primary)] ${
                  isUnread ? 'bg-[var(--bg-card)]' : 'opacity-85'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isUrgent
                      ? 'bg-rose-500/15 border-rose-500/30'
                      : 'bg-[var(--bg-primary)] border-[var(--border-subtle)]'
                  }`}
                >
                  {getIcon(notif)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <p
                      className={`text-xs font-bold truncate ${
                        isUnread
                          ? 'text-[var(--text-heading)]'
                          : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {notif.title}
                    </p>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 animate-pulse" />
                    )}
                  </div>

                  <p
                    className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed"
                  >
                    {notif.message}
                  </p>

                  <p className="text-[10px] text-[var(--text-muted)] mt-1 font-medium">
                    {formatDistanceToNow(new Date(notif.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div
        className="p-2.5 border-t text-center"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-card)',
        }}
      >
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate(viewAllPath);
          }}
          className="w-full py-2 px-3 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
        >
          <span>View All Notifications</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
