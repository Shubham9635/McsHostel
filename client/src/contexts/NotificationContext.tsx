import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationsApi } from '../services/api';
import type { Notification } from '../types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Bell, Wrench, ShieldAlert, UtensilsCrossed, Info, ExternalLink, Megaphone } from 'lucide-react';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  handleNotificationClick: (notif: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Audio notification helper using Web Audio API (Zero external MP3 dependencies)
function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch {
    // Gracefully ignore audio errors (e.g. autoplay policy)
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('disconnected');
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('hh_notif_sound') === 'true';
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem('hh_notif_sound', String(enabled));
  };

  // Fetch notifications and unread count from database
  const refreshNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await notificationsApi.getAll();
      const list = res.data?.notifications || [];
      const unread = res.data?.unread ?? list.filter((n: Notification) => !n.read && !n.is_read).length;
      setNotifications(list);
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to sync notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Mark a single notification as read
  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  // Actionable click router
  const handleNotificationClick = useCallback((notif: Notification) => {
    if (!notif.read && !notif.is_read) {
      markAsRead(notif.id);
    }

    const userRole = (user?.role as string) || '';
    const isAdmin = userRole === 'admin' || userRole === 'super_admin';
    const relatedType = notif.related_type || (notif.type === 'complaint' ? 'complaint' : notif.type === 'mess' ? 'mess' : notif.type === 'announcement' ? 'announcement' : 'system');
    const targetId = notif.related_id;

    if (relatedType === 'announcement') {
      window.location.href = targetId ? `/announcements/${targetId}` : (isAdmin ? '/admin/announcements' : '/student/notifications');
    } else if (relatedType === 'complaint') {
      if (isAdmin) {
        window.location.href = `/admin/complaints${targetId ? `?id=${targetId}` : ''}`;
      } else {
        window.location.href = targetId ? `/student/complaints/${targetId}` : '/student/complaints';
      }
    } else if (relatedType === 'safety_report') {
      if (isAdmin) {
        window.location.href = '/admin/safety';
      } else {
        window.location.href = '/student/safety/my-reports';
      }
    } else if (relatedType === 'mess') {
      if (isAdmin) {
        window.location.href = '/admin/mess';
      } else {
        window.location.href = '/student/mess';
      }
    } else {
      window.location.href = isAdmin ? '/admin/notifications' : '/student/notifications';
    }
  }, [user]);

  // Establish SSE real-time connection
  useEffect(() => {
    if (!token || !user) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      setConnectionStatus('disconnected');
      return;
    }

    // Initial load
    refreshNotifications();

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const streamUrl = `${apiBase}/api/notifications/stream?token=${encodeURIComponent(token)}`;

    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      setConnectionStatus('reconnecting');
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.addEventListener('connected', () => {
        setConnectionStatus('connected');
      });

      es.addEventListener('notification', (e) => {
        try {
          const newNotif: Notification = JSON.parse(e.data);

          // Update local state immediately
          setNotifications(prev => {
            if (prev.some(item => item.id === newNotif.id)) return prev;
            return [newNotif, ...prev];
          });
          setUnreadCount(prev => prev + 1);

          // Optional sound
          if (soundEnabled) {
            playNotificationSound();
          }

          // Show rich interactive toast
          const isUrgent = newNotif.priority === 'urgent' || newNotif.title.includes('URGENT') || newNotif.title.includes('🔴');
          
          toast.custom((t) => (
            <div
              className={`max-w-md w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-2xl rounded-2xl p-3.5 flex items-start gap-3 transition-all cursor-pointer hover:border-indigo-500/50 ${
                t.visible ? 'animate-enter' : 'animate-leave'
              } ${isUrgent ? 'ring-2 ring-rose-500 shadow-rose-500/20' : ''}`}
              onClick={() => {
                toast.dismiss(t.id);
                handleNotificationClick(newNotif);
              }}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg ${
                isUrgent ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/25'
              }`}>
                {newNotif.related_type === 'announcement' || newNotif.type === 'announcement' ? <Megaphone className="w-5 h-5" /> :
                 newNotif.related_type === 'safety_report' ? <ShieldAlert className="w-5 h-5" /> :
                 newNotif.related_type === 'complaint' ? <Wrench className="w-5 h-5" /> :
                 newNotif.related_type === 'mess' ? <UtensilsCrossed className="w-5 h-5" /> :
                 <Bell className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-[var(--text-heading)] truncate">
                    {newNotif.title}
                  </p>
                  <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold shrink-0 flex items-center gap-0.5">
                    View <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-0.5 leading-snug">
                  {newNotif.message}
                </p>
              </div>
            </div>
          ), { duration: isUrgent ? 6000 : 4000 });
        } catch (parseErr) {
          console.error('Failed to parse realtime notification:', parseErr);
        }
      });

      es.onerror = () => {
        setConnectionStatus('reconnecting');
        es.close();
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connectSSE, 5000);
      };
    };

    connectSSE();

    // Re-sync on window focus
    const onFocus = () => refreshNotifications();
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [token, user?.id, soundEnabled, refreshNotifications, handleNotificationClick]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        connectionStatus,
        soundEnabled,
        setSoundEnabled,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
        handleNotificationClick,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
