"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationStreamService = void 0;
const supabase_1 = require("../db/supabase");
class NotificationStreamService {
    constructor() {
        // Map of userId -> Set of ActiveClient
        this.clients = new Map();
        this.heartbeatInterval = null;
        this.recentlyPushedIds = new Set();
        this.startHeartbeat();
        this.initSupabaseRealtime();
    }
    /**
     * Register a new SSE connection for an authenticated user
     */
    addClient(userId, res) {
        // Set headers for Server-Sent Events
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering (e.g. nginx)
        res.flushHeaders?.();
        const client = {
            userId,
            res,
            connectedAt: new Date(),
        };
        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }
        this.clients.get(userId).add(client);
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
    removeClient(userId, client) {
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
    sendToUser(userId, notification) {
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
            }
            catch (err) {
                console.error(`Failed to push notification to client ${userId}:`, err);
            }
        }
        return true;
    }
    /**
     * Send a notification to multiple users
     */
    sendToUsers(userIds, notification) {
        for (const id of userIds) {
            this.sendToUser(id, notification);
        }
    }
    /**
     * Periodic keepalive heartbeat ping
     */
    startHeartbeat() {
        if (this.heartbeatInterval)
            clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = setInterval(() => {
            for (const [userId, userClients] of this.clients.entries()) {
                for (const client of userClients) {
                    try {
                        client.res.write(`:ping ${Date.now()}\n\n`);
                    }
                    catch {
                        this.removeClient(userId, client);
                    }
                }
            }
        }, 25000);
    }
    /**
     * Subscribe to Supabase Realtime Postgres Changes
     */
    initSupabaseRealtime() {
        try {
            supabase_1.supabase
                .channel('realtime:notifications_system')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                const newNotif = payload.new;
                if (!newNotif || !newNotif.user_id)
                    return;
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
            })
                .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('⚡ Supabase Realtime channel connected for notifications table');
                }
            });
        }
        catch (err) {
            console.warn('⚠️ Supabase Realtime subscription init note:', err);
        }
    }
    /**
     * Returns active connection metrics
     */
    getStats() {
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
exports.notificationStreamService = new NotificationStreamService();
exports.default = exports.notificationStreamService;
