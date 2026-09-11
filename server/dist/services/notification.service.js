"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const supabase_1 = require("../db/supabase");
const notification_stream_service_1 = require("./notification-stream.service");
class NotificationService {
    /**
     * Helper to normalize database type value to satisfy CHECK constraint:
     * CHECK (type IN ('complaint', 'mess', 'announcement', 'info'))
     */
    static normalizeDbType(type) {
        if (type === 'complaint' || type === 'new_complaint' || type === 'complaint_assigned' || type === 'complaint_status_changed') {
            return 'complaint';
        }
        if (type === 'mess' || type === 'new_mess_feedback') {
            return 'mess';
        }
        if (type === 'announcement' || type === 'system_notification') {
            return 'announcement';
        }
        return 'info'; // Default for safety reports and general notifications
    }
    /**
     * Create a notification record and push immediately via real-time stream
     */
    static async createNotification(input) {
        const { recipient_user_id, title, message, type = 'info', related_type, related_id, priority = 'normal', actor_user_id, metadata = {}, } = input;
        if (!recipient_user_id) {
            console.warn('⚠️ Cannot create notification: recipient_user_id is missing');
            return null;
        }
        try {
            const dbType = this.normalizeDbType(type);
            const isComplaint = related_type === 'complaint' || dbType === 'complaint';
            const relatedComplaintId = isComplaint && related_id ? related_id : null;
            // 1. Insert into Supabase notifications table
            const { data, error } = await supabase_1.supabase
                .from('notifications')
                .insert({
                user_id: recipient_user_id,
                title,
                message,
                type: dbType,
                related_complaint_id: relatedComplaintId,
                is_read: false,
            })
                .select()
                .single();
            if (error || !data) {
                console.error('❌ Failed to insert notification in DB:', error);
                return null;
            }
            // 2. Format rich notification object for clients
            const richNotification = {
                ...data,
                recipient_user_id,
                read: false,
                priority: priority || (title.includes('URGENT') || title.includes('🔴') ? 'urgent' : 'normal'),
                related_type: related_type || (dbType === 'complaint' ? 'complaint' : dbType === 'mess' ? 'mess' : 'system'),
                related_id: related_id || data.related_complaint_id,
                actor_user_id: actor_user_id || null,
                metadata: {
                    ...metadata,
                    original_type: type,
                },
            };
            // 3. Immediately dispatch via real-time SSE stream
            notification_stream_service_1.notificationStreamService.sendToUser(recipient_user_id, richNotification);
            return richNotification;
        }
        catch (err) {
            console.error('Unexpected error creating notification:', err);
            return null;
        }
    }
    /**
     * Notify all authorized administrators / hostel management
     */
    static async notifyAdmins(input) {
        try {
            const { data: admins, error } = await supabase_1.supabase
                .from('profiles')
                .select('id, name, email, role')
                .in('role', ['admin', 'super_admin'])
                .eq('is_active', true);
            if (error || !admins || admins.length === 0) {
                console.warn('⚠️ No active admins found to receive notification');
                return [];
            }
            const results = [];
            for (const admin of admins) {
                const notif = await this.createNotification({
                    ...input,
                    recipient_user_id: admin.id,
                });
                if (notif)
                    results.push(notif);
            }
            return results;
        }
        catch (err) {
            console.error('Error notifying admins:', err);
            return [];
        }
    }
    /**
     * Notify assigned staff member if valid staff ID is provided
     */
    static async notifyStaff(staffId, input) {
        if (!staffId)
            return null;
        return this.createNotification({
            ...input,
            recipient_user_id: staffId,
        });
    }
    /**
     * Helper for student-directed notifications
     */
    static async notifyStudent(studentId, input) {
        return this.createNotification({
            ...input,
            recipient_user_id: studentId,
        });
    }
}
exports.NotificationService = NotificationService;
exports.default = NotificationService;
