import { Response } from 'express';
import { supabase } from '../db/supabase';

interface ActiveClient {
  userId: string;
  res: Response;
  connectedAt: Date;
}

class NotificationStreamService {
  // Map of userId -> Set of ActiveClient
  private clients: Map<string, Set<ActiveClient>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private recentlyPushedIds: Set<string> = new Set();

  constructor() {
    this.startHeartbeat();
    this.initSupabaseRealtime();
  }

  /**
   * Register a new SSE connection for an authenticated user
   */
  public addClient(userId: string, res: Response): void {
    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering (e.g. nginx)
    res.flushHeaders?.();

    const client: ActiveClient = {
      userId,
      res,
      connectedAt: new Date(),
    };

    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(client);

    // Initial greeting event with connection acknowledgment
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', userId, timestamp: new Date().toISOString() })}\n\n`);

    // Handle client disconnect
    res.on('close', () => {
      this.removeClient(userId, client);
    });
  }

  /**
   * Remove a client connection on socket close
   */
  private removeClient(userId: string, client: ActiveClient): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.delete(client);
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  /**
   * Send a notification in real-time to a specific user
   */
  public sendToUser(userId: string, notification: any): boolean {
    const userClients = this.clients.get(userId);
    if (!userClients || userClients.size === 0) {
      return false; // User not currently online/connected
    }

    if (notification.id) {
      this.recentlyPushedIds.add(notification.id);
      // Prune memory after 30 seconds
      setTimeout(() => this.recentlyPushedIds.delete(notification.id), 30000);
    }

    const payload = JSON.stringify(notification);
    for (const client of userClients) {
      try {
        client.res.write(`event: notification\ndata: ${payload}\n\n`);
      } catch (err) {
        console.error(`Failed to push notification to client ${userId}:`, err);
      }
    }
    return true;
  }

  /**
   * Send a notification to multiple users
   */
  public sendToUsers(userIds: string[], notification: any): void {
    for (const id of userIds) {
      this.sendToUser(id, notification);
    }
  }

  /**
   * Periodic keepalive heartbeat ping
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      for (const [userId, userClients] of this.clients.entries()) {
        for (const client of userClients) {
          try {
            client.res.write(`:ping ${Date.now()}\n\n`);
          } catch {
            this.removeClient(userId, client);
          }
        }
      }
    }, 25000);
  }

  /**
   * Subscribe to Supabase Realtime Postgres Changes
   */
  private initSupabaseRealtime(): void {
    try {
      supabase
        .channel('realtime:notifications_system')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            const newNotif = payload.new as any;
            if (!newNotif || !newNotif.user_id) return;

            // Avoid duplicate delivery if already pushed directly by our service
            if (newNotif.id && this.recentlyPushedIds.has(newNotif.id)) {
              return;
            }

            const formatted = {
              ...newNotif,
              recipient_user_id: newNotif.user_id,
              read: newNotif.is_read,
              related_id: newNotif.related_complaint_id,
              related_type: newNotif.type === 'complaint' ? 'complaint' : newNotif.type,
            };

            this.sendToUser(newNotif.user_id, formatted);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('⚡ Supabase Realtime channel connected for notifications table');
          }
        });
    } catch (err) {
      console.warn('⚠️ Supabase Realtime subscription init note:', err);
    }
  }

  /**
   * Returns active connection metrics
   */
  public getStats() {
    let totalConnections = 0;
    for (const set of this.clients.values()) {
      totalConnections += set.size;
    }
    return {
      activeUsers: this.clients.size,
      totalConnections,
    };
  }
}

export const notificationStreamService = new NotificationStreamService();
export default notificationStreamService;
