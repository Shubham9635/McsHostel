"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsService = void 0;
const supabase_1 = require("../db/supabase");
const notification_stream_service_1 = require("./notification-stream.service");
const demo_1 = require("../utils/demo");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Resilient file fallback cache for environments before DB schema migration is executed
const FALLBACK_FILE = path_1.default.join(__dirname, '../../data/announcements_fallback.json');
function ensureDataDir() {
    const dir = path_1.default.dirname(FALLBACK_FILE);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
}
function loadFallbackData() {
    try {
        ensureDataDir();
        if (fs_1.default.existsSync(FALLBACK_FILE)) {
            const content = fs_1.default.readFileSync(FALLBACK_FILE, 'utf-8');
            return JSON.parse(content);
        }
    }
    catch (err) {
        console.error('Error reading announcements fallback store:', err);
    }
    return { announcements: [], reads: {} };
}
function saveFallbackData(data) {
    try {
        ensureDataDir();
        fs_1.default.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }
    catch (err) {
        console.error('Error saving announcements fallback store:', err);
    }
}
class AnnouncementsService {
    /**
     * Determine whether the announcements table is available in Supabase
     */
    static async checkDbAvailable() {
        if (this.useDbTable !== null)
            return this.useDbTable;
        try {
            const { error } = await supabase_1.supabase.from('announcements').select('id').limit(1);
            this.useDbTable = !error;
            if (!this.useDbTable) {
                console.info('ℹ️ Announcements table not yet detected in Supabase schema. Using persistent fallback store until migration is applied.');
            }
            return this.useDbTable;
        }
        catch {
            this.useDbTable = false;
            return false;
        }
    }
    /**
     * Get total count of active students for read analytics
     */
    static async getActiveStudentCount(isDemo = false) {
        try {
            const { data: students, error } = await supabase_1.supabase
                .from('profiles')
                .select('id, email')
                .eq('role', 'student')
                .eq('is_active', true);
            if (!error && students) {
                if (!isDemo) {
                    return students.filter(s => !(0, demo_1.isDummyStudent)(s)).length;
                }
                return students.length;
            }
        }
        catch (err) {
            console.warn('Could not query active student count:', err);
        }
        return isDemo ? 8 : 1;
    }
    /**
     * List announcements with filtering and search
     */
    static async listAnnouncements(options) {
        const isDb = await this.checkDbAvailable();
        const totalStudents = await this.getActiveStudentCount();
        if (isDb) {
            try {
                let query = supabase_1.supabase.from('announcements').select('*');
                if (options.role === 'student') {
                    query = query.eq('status', 'published');
                }
                else if (options.status && options.status !== 'all') {
                    query = query.eq('status', options.status);
                }
                if (options.category && options.category !== 'all') {
                    query = query.eq('category', options.category);
                }
                if (options.priority && options.priority !== 'all') {
                    query = query.eq('priority', options.priority);
                }
                query = query.order('created_at', { ascending: false });
                const { data, error } = await query;
                if (error)
                    throw error;
                let results = (data || []).map((row) => ({
                    ...row,
                    total_students: totalStudents,
                }));
                // Search filtering (Title, message, category)
                if (options.search && options.search.trim()) {
                    const q = options.search.toLowerCase().trim();
                    results = results.filter((a) => a.title.toLowerCase().includes(q) ||
                        a.message.toLowerCase().includes(q) ||
                        a.category.toLowerCase().includes(q));
                }
                // Fetch read counts
                try {
                    const { data: readData } = await supabase_1.supabase.from('announcement_reads').select('announcement_id, student_id');
                    if (readData) {
                        const countMap = {};
                        readData.forEach((r) => {
                            if (!countMap[r.announcement_id])
                                countMap[r.announcement_id] = new Set();
                            countMap[r.announcement_id].add(r.student_id);
                        });
                        results = results.map((a) => ({
                            ...a,
                            read_count: countMap[a.id]?.size || 0,
                            has_read: options.userId ? countMap[a.id]?.has(options.userId) || false : false,
                        }));
                    }
                }
                catch {
                    // Ignore read count errors
                }
                return results;
            }
            catch (dbErr) {
                console.warn('DB query failed, using fallback store:', dbErr);
            }
        }
        // Fallback store
        const store = loadFallbackData();
        let list = [...store.announcements];
        // Ensure status expiration
        const now = new Date().toISOString();
        list = list.map((item) => {
            if (item.status === 'published' && item.expires_at && item.expires_at < now) {
                return { ...item, status: 'expired' };
            }
            return item;
        });
        if (options.role === 'student') {
            list = list.filter((a) => a.status === 'published');
        }
        else if (options.status && options.status !== 'all') {
            list = list.filter((a) => a.status === options.status);
        }
        if (options.category && options.category !== 'all') {
            list = list.filter((a) => a.category.toLowerCase() === options.category.toLowerCase());
        }
        if (options.priority && options.priority !== 'all') {
            list = list.filter((a) => a.priority.toLowerCase() === options.priority.toLowerCase());
        }
        if (options.search && options.search.trim()) {
            const q = options.search.toLowerCase().trim();
            list = list.filter((a) => a.title.toLowerCase().includes(q) ||
                a.message.toLowerCase().includes(q) ||
                a.category.toLowerCase().includes(q));
        }
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return list.map((a) => ({
            ...a,
            total_students: totalStudents,
            read_count: store.reads[a.id]?.length || 0,
            has_read: options.userId ? (store.reads[a.id] || []).includes(options.userId) : false,
        }));
    }
    /**
     * Get single announcement by ID
     */
    static async getById(id, userId) {
        const isDb = await this.checkDbAvailable();
        const totalStudents = await this.getActiveStudentCount();
        if (isDb) {
            try {
                const { data, error } = await supabase_1.supabase.from('announcements').select('*').eq('id', id).single();
                if (!error && data) {
                    let readCount = 0;
                    let hasRead = false;
                    try {
                        const { data: reads } = await supabase_1.supabase.from('announcement_reads').select('student_id').eq('announcement_id', id);
                        if (reads) {
                            readCount = reads.length;
                            if (userId)
                                hasRead = reads.some((r) => r.student_id === userId);
                        }
                    }
                    catch {
                        // ignore
                    }
                    return {
                        ...data,
                        total_students: totalStudents,
                        read_count: readCount,
                        has_read: hasRead,
                    };
                }
            }
            catch {
                // fallback
            }
        }
        const store = loadFallbackData();
        const found = store.announcements.find((a) => a.id === id);
        if (!found)
            return null;
        return {
            ...found,
            total_students: totalStudents,
            read_count: store.reads[id]?.length || 0,
            has_read: userId ? (store.reads[id] || []).includes(userId) : false,
        };
    }
    /**
     * Create an announcement (draft or published)
     */
    static async createAnnouncement(input) {
        const id = (await Promise.resolve().then(() => __importStar(require('crypto')))).randomUUID();
        const now = new Date().toISOString();
        const isPublished = input.status === 'published';
        const record = {
            id,
            title: input.title.trim(),
            message: input.message.trim(),
            category: input.category || 'General',
            priority: input.priority || 'normal',
            status: input.status || 'draft',
            created_by: input.created_by || null,
            created_by_name: 'Hostel Management',
            attachment_url: input.attachment_url || null,
            attachment_name: input.attachment_name || null,
            attachment_type: input.attachment_type || null,
            attachment_size: input.attachment_size || null,
            published_at: isPublished ? (input.published_at || now) : null,
            expires_at: input.expires_at || null,
            metadata: {},
            created_at: now,
            updated_at: now,
        };
        const isDb = await this.checkDbAvailable();
        if (isDb) {
            try {
                const { data, error } = await supabase_1.supabase.from('announcements').insert(record).select().single();
                if (!error && data) {
                    if (isPublished) {
                        await this.deliverMassNotification(record);
                    }
                    return data;
                }
            }
            catch (err) {
                console.error('Failed to create announcement in Supabase DB:', err);
            }
        }
        // Persist in fallback store
        const store = loadFallbackData();
        store.announcements.unshift(record);
        saveFallbackData(store);
        if (isPublished) {
            await this.deliverMassNotification(record);
        }
        return record;
    }
    /**
     * Update existing announcement
     */
    static async updateAnnouncement(id, updates) {
        const isDb = await this.checkDbAvailable();
        const now = new Date().toISOString();
        if (isDb) {
            try {
                const { data, error } = await supabase_1.supabase
                    .from('announcements')
                    .update({ ...updates, updated_at: now })
                    .eq('id', id)
                    .select()
                    .single();
                if (!error && data)
                    return data;
            }
            catch (err) {
                console.error('Update in DB failed:', err);
            }
        }
        const store = loadFallbackData();
        const index = store.announcements.findIndex((a) => a.id === id);
        if (index === -1)
            return null;
        store.announcements[index] = {
            ...store.announcements[index],
            ...updates,
            updated_at: now,
        };
        saveFallbackData(store);
        return store.announcements[index];
    }
    /**
     * Publish an existing draft or scheduled announcement to all students
     */
    static async publishAnnouncement(id) {
        const existing = await this.getById(id);
        if (!existing)
            return null;
        // Avoid duplicate mass notifications if already published
        if (existing.status === 'published') {
            return existing;
        }
        const now = new Date().toISOString();
        const updated = await this.updateAnnouncement(id, {
            status: 'published',
            published_at: now,
        });
        if (updated) {
            await this.deliverMassNotification(updated);
        }
        return updated;
    }
    /**
     * Delete or archive announcement
     */
    static async deleteAnnouncement(id) {
        const isDb = await this.checkDbAvailable();
        if (isDb) {
            try {
                await supabase_1.supabase.from('announcements').delete().eq('id', id);
                await supabase_1.supabase.from('announcement_reads').delete().eq('announcement_id', id);
            }
            catch {
                // continue to fallback
            }
        }
        const store = loadFallbackData();
        store.announcements = store.announcements.filter((a) => a.id !== id);
        delete store.reads[id];
        saveFallbackData(store);
        return true;
    }
    /**
     * Record that a student has viewed/read an announcement
     */
    static async recordRead(announcementId, studentId) {
        if (!announcementId || !studentId)
            return false;
        const isDb = await this.checkDbAvailable();
        if (isDb) {
            try {
                await supabase_1.supabase.from('announcement_reads').upsert({
                    announcement_id: announcementId,
                    student_id: studentId,
                    read_at: new Date().toISOString(),
                }, { onConflict: 'announcement_id,student_id' });
            }
            catch {
                // continue to fallback
            }
        }
        const store = loadFallbackData();
        if (!store.reads[announcementId]) {
            store.reads[announcementId] = [];
        }
        if (!store.reads[announcementId].includes(studentId)) {
            store.reads[announcementId].push(studentId);
            saveFallbackData(store);
        }
        return true;
    }
    /**
     * Server-side mass notification delivery to ALL active students
     */
    static async deliverMassNotification(announcement) {
        try {
            // 1. Fetch all active student accounts from Supabase profiles
            const { data: students, error } = await supabase_1.supabase
                .from('profiles')
                .select('id, name, email')
                .eq('role', 'student')
                .eq('is_active', true);
            if (error || !students || students.length === 0) {
                console.warn('⚠️ No active student accounts found to receive announcement broadcast.');
                return;
            }
            const activeList = students.filter(s => !(0, demo_1.isDummyStudent)(s));
            const targetStudents = activeList.length > 0 ? activeList : students;
            const priorityEmoji = announcement.priority === 'urgent' ? '🔴' : announcement.priority === 'important' ? '🟠' : '📢';
            const notificationTitle = `${priorityEmoji} ${announcement.title}`;
            const notificationMessage = announcement.message.length > 200
                ? announcement.message.slice(0, 197) + '...'
                : announcement.message;
            // 2. Prepare bulk insert payload for existing notifications table
            const batchInserts = targetStudents.map((student) => ({
                user_id: student.id,
                title: notificationTitle,
                message: notificationMessage,
                type: 'announcement',
                related_complaint_id: null,
                is_read: false,
            }));
            // 3. Perform efficient batch insert into Supabase notifications table (chunks of 100)
            const chunkSize = 100;
            for (let i = 0; i < batchInserts.length; i += chunkSize) {
                const chunk = batchInserts.slice(i, i + chunkSize);
                const { error: insertErr } = await supabase_1.supabase.from('notifications').insert(chunk);
                if (insertErr) {
                    console.error('Batch notification insert error:', insertErr);
                }
            }
            // 4. Push real-time event via SSE stream to all connected student clients
            const studentIds = targetStudents.map((s) => s.id);
            const ssePayload = {
                id: (await Promise.resolve().then(() => __importStar(require('crypto')))).randomUUID(),
                title: notificationTitle,
                message: notificationMessage,
                type: 'announcement',
                related_type: 'announcement',
                related_id: announcement.id,
                priority: announcement.priority,
                read: false,
                is_read: false,
                created_at: new Date().toISOString(),
                metadata: {
                    announcement_id: announcement.id,
                    category: announcement.category,
                    attachment_url: announcement.attachment_url,
                },
            };
            notification_stream_service_1.notificationStreamService.sendToUsers(studentIds, ssePayload);
            console.log(`📢 Announcement "${announcement.title}" broadcasted to ${students.length} students.`);
        }
        catch (err) {
            console.error('Failed to deliver mass announcement notification:', err);
        }
    }
    /**
     * Get analytics overview for admin dashboard
     */
    static async getAnalyticsOverview(isDemo = false) {
        const list = await this.listAnnouncements({ role: 'admin' });
        const totalStudents = await this.getActiveStudentCount(isDemo);
        const stats = {
            total: list.length,
            published: list.filter((a) => a.status === 'published').length,
            drafts: list.filter((a) => a.status === 'draft').length,
            scheduled: list.filter((a) => a.status === 'scheduled').length,
            expired: list.filter((a) => a.status === 'expired').length,
            totalStudents,
        };
        return stats;
    }
}
exports.AnnouncementsService = AnnouncementsService;
AnnouncementsService.useDbTable = null;
exports.default = AnnouncementsService;
