"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const announcements_service_1 = require("../services/announcements.service");
const supabase_1 = require("../db/supabase");
const demo_1 = require("../utils/demo");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Multer memory storage for announcement attachments (images, PDFs, documents up to 10MB)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        const allowed = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];
        if (allowed.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Supported types: images, PDFs, text documents.'));
        }
    },
});
// ── GET /api/announcements (List announcements) ──────────────────────────────
router.get('/', async (req, res) => {
    try {
        const role = req.user?.role || 'student';
        const { status, category, priority, search } = req.query;
        const list = await announcements_service_1.AnnouncementsService.listAnnouncements({
            role,
            userId: req.user?.id,
            status: status,
            category: category,
            priority: priority,
            search: search,
        });
        return res.json({ announcements: list });
    }
    catch (err) {
        console.error('Failed to list announcements:', err);
        return res.status(500).json({ error: 'Failed to fetch announcements.' });
    }
});
// ── GET /api/announcements/stats (Admin analytics) ───────────────────────────
router.get('/stats', auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const isDemo = (0, demo_1.isDemoUser)(req.user);
        const stats = await announcements_service_1.AnnouncementsService.getAnalyticsOverview(isDemo);
        return res.json(stats);
    }
    catch (err) {
        console.error('Failed to fetch announcement stats:', err);
        return res.status(500).json({ error: 'Failed to fetch analytics.' });
    }
});
// ── GET /api/announcements/:id (Single details + record read for students) ───
router.get('/:id', async (req, res) => {
    try {
        const announcement = await announcements_service_1.AnnouncementsService.getById(req.params.id, req.user?.id);
        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found.' });
        }
        // If student, check if published
        if (req.user?.role === 'student' && announcement.status !== 'published') {
            return res.status(403).json({ error: 'Access denied.' });
        }
        // Record read status for student
        if (req.user?.role === 'student' && req.user?.id) {
            await announcements_service_1.AnnouncementsService.recordRead(announcement.id, req.user.id);
            announcement.has_read = true;
        }
        return res.json({ announcement });
    }
    catch (err) {
        console.error('Failed to fetch announcement detail:', err);
        return res.status(500).json({ error: 'Failed to fetch announcement.' });
    }
});
// ── POST /api/announcements (Create draft or publish) ───────────────────────
router.post('/', auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const { title, message, category = 'General', priority = 'normal', status = 'draft', attachment_url, attachment_name, attachment_type, attachment_size, published_at, expires_at, } = req.body;
        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Title is required.' });
        }
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message content is required.' });
        }
        const created = await announcements_service_1.AnnouncementsService.createAnnouncement({
            title: title.trim(),
            message: message.trim(),
            category,
            priority,
            status,
            created_by: req.user?.id,
            created_by_name: 'Hostel Management',
            attachment_url,
            attachment_name,
            attachment_type,
            attachment_size,
            published_at,
            expires_at,
        });
        return res.status(201).json({
            success: true,
            announcement: created,
            message: status === 'published'
                ? 'Announcement published and broadcasted to all students!'
                : 'Announcement draft saved successfully.',
        });
    }
    catch (err) {
        console.error('Failed to create announcement:', err);
        return res.status(500).json({ error: 'Failed to create announcement.' });
    }
});
// ── PATCH /api/announcements/:id (Update announcement) ───────────────────────
router.patch('/:id', auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const updated = await announcements_service_1.AnnouncementsService.updateAnnouncement(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Announcement not found.' });
        }
        return res.json({ success: true, announcement: updated });
    }
    catch (err) {
        console.error('Failed to update announcement:', err);
        return res.status(500).json({ error: 'Failed to update announcement.' });
    }
});
// ── POST /api/announcements/:id/publish (Publish to all students) ────────────
router.post('/:id/publish', auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const published = await announcements_service_1.AnnouncementsService.publishAnnouncement(req.params.id);
        if (!published) {
            return res.status(404).json({ error: 'Announcement not found.' });
        }
        return res.json({
            success: true,
            announcement: published,
            message: 'Announcement published successfully to all active students.',
        });
    }
    catch (err) {
        console.error('Failed to publish announcement:', err);
        return res.status(500).json({ error: 'Failed to publish announcement.' });
    }
});
// ── DELETE /api/announcements/:id (Delete announcement) ──────────────────────
router.delete('/:id', auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const success = await announcements_service_1.AnnouncementsService.deleteAnnouncement(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Announcement not found.' });
        }
        return res.json({ success: true, message: 'Announcement deleted successfully.' });
    }
    catch (err) {
        console.error('Failed to delete announcement:', err);
        return res.status(500).json({ error: 'Failed to delete announcement.' });
    }
});
// ── POST /api/announcements/upload (Upload announcement attachment) ───────────
router.post('/upload', auth_middleware_1.requireAdmin, upload.single('attachment'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No attachment file uploaded.' });
        }
        const ext = req.file.originalname.split('.').pop() || 'file';
        const filename = `announcements/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;
        // Try uploading to Supabase Storage bucket 'announcement-attachments' or 'complaint-photos'
        let publicUrl = null;
        try {
            const { error: uploadErr } = await supabase_1.supabase.storage
                .from('announcement-attachments')
                .upload(filename, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false,
            });
            if (!uploadErr) {
                const { data: urlData } = supabase_1.supabase.storage
                    .from('announcement-attachments')
                    .getPublicUrl(filename);
                publicUrl = urlData.publicUrl;
            }
        }
        catch {
            // Bucket might not exist yet, fallback to base64 data URI for demo / instant local reliability
        }
        if (!publicUrl) {
            // Fallback to data URI if storage bucket is not configured
            const base64 = req.file.buffer.toString('base64');
            publicUrl = `data:${req.file.mimetype};base64,${base64}`;
        }
        return res.json({
            url: publicUrl,
            name: req.file.originalname,
            type: req.file.mimetype,
            size: req.file.size,
        });
    }
    catch (err) {
        console.error('Attachment upload failed:', err);
        return res.status(500).json({ error: 'Failed to upload attachment.' });
    }
});
exports.default = router;
