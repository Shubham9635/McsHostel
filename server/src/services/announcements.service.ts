import { supabase } from '../db/supabase';
import { notificationStreamService } from './notification-stream.service';
import { isDummyStudent } from '../utils/demo';
import fs from 'fs';
import path from 'path';

export interface AnnouncementRecord {
  id: string;
  title: string;
  message: string;
  category: 'General' | 'Maintenance' | 'Mess' | 'Event' | 'Emergency' | 'Important' | 'Other';
  priority: 'normal' | 'important' | 'urgent';
  status: 'draft' | 'published' | 'scheduled' | 'expired' | 'archived';
  created_by?: string | null;
  created_by_name: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  attachment_size?: number | null;
  published_at?: string | null;
  expires_at?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  read_count?: number;
  total_students?: number;
  has_read?: boolean;
}

// Resilient file fallback cache for environments before DB schema migration is executed
const FALLBACK_FILE = path.join(__dirname, '../../data/announcements_fallback.json');

function ensureDataDir() {
  const dir = path.dirname(FALLBACK_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadFallbackData(): { announcements: AnnouncementRecord[]; reads: Record<string, string[]> } {
  try {
    ensureDataDir();
    if (fs.existsSync(FALLBACK_FILE)) {
      const content = fs.readFileSync(FALLBACK_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading announcements fallback store:', err);
  }
  return { announcements: [], reads: {} };
}

function saveFallbackData(data: { announcements: AnnouncementRecord[]; reads: Record<string, string[]> }) {
  try {
    ensureDataDir();
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving announcements fallback store:', err);
  }
}

export class AnnouncementsService {
  private static useDbTable: boolean | null = null;

  /**
   * Determine whether the announcements table is available in Supabase
   */
  private static async checkDbAvailable(): Promise<boolean> {
    if (this.useDbTable !== null) return this.useDbTable;
    try {
      const { error } = await supabase.from('announcements').select('id').limit(1);
      this.useDbTable = !error;
      if (!this.useDbTable) {
        console.info('ℹ️ Announcements table not yet detected in Supabase schema. Using persistent fallback store until migration is applied.');
      }
      return this.useDbTable;
    } catch {
      this.useDbTable = false;
      return false;
    }
  }

  /**
   * Get total count of active students for read analytics
   */
  public static async getActiveStudentCount(isDemo: boolean = false): Promise<number> {
    try {
      const { data: students, error } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('role', 'student')
        .eq('is_active', true);

      if (!error && students) {
        if (!isDemo) {
          return students.filter(s => !isDummyStudent(s)).length;
        }
        return students.length;
      }
    } catch (err) {
      console.warn('Could not query active student count:', err);
    }
    return isDemo ? 8 : 1;
  }

  /**
   * List announcements with filtering and search
   */
  public static async listAnnouncements(options: {
    role: 'student' | 'admin' | 'staff';
    userId?: string;
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
  }): Promise<AnnouncementRecord[]> {
    const isDb = await this.checkDbAvailable();
    const totalStudents = await this.getActiveStudentCount();

    if (isDb) {
      try {
        let query = supabase.from('announcements').select('*');

        if (options.role === 'student') {
          query = query.eq('status', 'published');
        } else if (options.status && options.status !== 'all') {
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
        if (error) throw error;

        let results: AnnouncementRecord[] = (data || []).map((row: any) => ({
          ...row,
          total_students: totalStudents,
        }));

        // Search filtering (Title, message, category)
        if (options.search && options.search.trim()) {
          const q = options.search.toLowerCase().trim();
          results = results.filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              a.message.toLowerCase().includes(q) ||
              a.category.toLowerCase().includes(q)
          );
        }

        // Fetch read counts
        try {
          const { data: readData } = await supabase.from('announcement_reads').select('announcement_id, student_id');
          if (readData) {
            const countMap: Record<string, Set<string>> = {};
            readData.forEach((r: any) => {
              if (!countMap[r.announcement_id]) countMap[r.announcement_id] = new Set();
              countMap[r.announcement_id].add(r.student_id);
            });

            results = results.map((a) => ({
              ...a,
              read_count: countMap[a.id]?.size || 0,
              has_read: options.userId ? countMap[a.id]?.has(options.userId) || false : false,
            }));
          }
        } catch {
          // Ignore read count errors
        }

        return results;
      } catch (dbErr) {
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
        return { ...item, status: 'expired' as const };
      }
      return item;
    });

    if (options.role === 'student') {
      list = list.filter((a) => a.status === 'published');
    } else if (options.status && options.status !== 'all') {
      list = list.filter((a) => a.status === options.status);
    }

    if (options.category && options.category !== 'all') {
      list = list.filter((a) => a.category.toLowerCase() === options.category!.toLowerCase());
    }
    if (options.priority && options.priority !== 'all') {
      list = list.filter((a) => a.priority.toLowerCase() === options.priority!.toLowerCase());
    }

    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
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
  public static async getById(id: string, userId?: string): Promise<AnnouncementRecord | null> {
    const isDb = await this.checkDbAvailable();
    const totalStudents = await this.getActiveStudentCount();

    if (isDb) {
      try {
        const { data, error } = await supabase.from('announcements').select('*').eq('id', id).single();
        if (!error && data) {
          let readCount = 0;
          let hasRead = false;
          try {
            const { data: reads } = await supabase.from('announcement_reads').select('student_id').eq('announcement_id', id);
            if (reads) {
              readCount = reads.length;
              if (userId) hasRead = reads.some((r: any) => r.student_id === userId);
            }
          } catch {
            // ignore
          }

          return {
            ...data,
            total_students: totalStudents,
            read_count: readCount,
            has_read: hasRead,
          };
        }
      } catch {
        // fallback
      }
    }

    const store = loadFallbackData();
    const found = store.announcements.find((a) => a.id === id);
    if (!found) return null;

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
  public static async createAnnouncement(input: {
    title: string;
    message: string;
    category?: 'General' | 'Maintenance' | 'Mess' | 'Event' | 'Emergency' | 'Important' | 'Other';
    priority?: 'normal' | 'important' | 'urgent';
    status?: 'draft' | 'published' | 'scheduled';
    created_by?: string;
    created_by_name?: string;
    attachment_url?: string | null;
    attachment_name?: string | null;
    attachment_type?: string | null;
    attachment_size?: number | null;
    published_at?: string | null;
    expires_at?: string | null;
  }): Promise<AnnouncementRecord> {
    const id = (await import('crypto')).randomUUID();
    const now = new Date().toISOString();
    const isPublished = input.status === 'published';

    const record: AnnouncementRecord = {
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
        const { data, error } = await supabase.from('announcements').insert(record).select().single();
        if (!error && data) {
          if (isPublished) {
            await this.deliverMassNotification(record);
          }
          return data;
        }
      } catch (err) {
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
  public static async updateAnnouncement(id: string, updates: Partial<AnnouncementRecord>): Promise<AnnouncementRecord | null> {
    const isDb = await this.checkDbAvailable();
    const now = new Date().toISOString();

    if (isDb) {
      try {
        const { data, error } = await supabase
          .from('announcements')
          .update({ ...updates, updated_at: now })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.error('Update in DB failed:', err);
      }
    }

    const store = loadFallbackData();
    const index = store.announcements.findIndex((a) => a.id === id);
    if (index === -1) return null;

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
  public static async publishAnnouncement(id: string): Promise<AnnouncementRecord | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

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
  public static async deleteAnnouncement(id: string): Promise<boolean> {
    const isDb = await this.checkDbAvailable();
    if (isDb) {
      try {
        await supabase.from('announcements').delete().eq('id', id);
        await supabase.from('announcement_reads').delete().eq('announcement_id', id);
      } catch {
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
  public static async recordRead(announcementId: string, studentId: string): Promise<boolean> {
    if (!announcementId || !studentId) return false;

    const isDb = await this.checkDbAvailable();
    if (isDb) {
      try {
        await supabase.from('announcement_reads').upsert(
          {
            announcement_id: announcementId,
            student_id: studentId,
            read_at: new Date().toISOString(),
          },
          { onConflict: 'announcement_id,student_id' }
        );
      } catch {
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
  public static async deliverMassNotification(announcement: AnnouncementRecord): Promise<void> {
    try {
      // 1. Fetch all active student accounts from Supabase profiles
      const { data: students, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'student')
        .eq('is_active', true);

      if (error || !students || students.length === 0) {
        console.warn('⚠️ No active student accounts found to receive announcement broadcast.');
        return;
      }

      const activeList = students.filter(s => !isDummyStudent(s));
      const targetStudents = activeList.length > 0 ? activeList : students;

      const priorityEmoji =
        announcement.priority === 'urgent' ? '🔴' : announcement.priority === 'important' ? '🟠' : '📢';
      
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
        const { error: insertErr } = await supabase.from('notifications').insert(chunk);
        if (insertErr) {
          console.error('Batch notification insert error:', insertErr);
        }
      }

      // 4. Push real-time event via SSE stream to all connected student clients
      const studentIds = targetStudents.map((s) => s.id);
      const ssePayload = {
        id: (await import('crypto')).randomUUID(),
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

      notificationStreamService.sendToUsers(studentIds, ssePayload);
      console.log(`📢 Announcement "${announcement.title}" broadcasted to ${students.length} students.`);
    } catch (err) {
      console.error('Failed to deliver mass announcement notification:', err);
    }
  }

  /**
   * Get analytics overview for admin dashboard
   */
  public static async getAnalyticsOverview(isDemo: boolean = false): Promise<{
    total: number;
    published: number;
    drafts: number;
    scheduled: number;
    expired: number;
    totalStudents: number;
  }> {
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

export default AnnouncementsService;
