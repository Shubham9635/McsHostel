import { Router, Response } from 'express';
import multer from 'multer';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth.middleware';
import { AnnouncementsService } from '../services/announcements.service';
import { supabase } from '../db/supabase';
import { isDemoUser } from '../utils/demo';

const router = Router();
router.use(authenticate);

// Multer memory storage for announcement attachments (images, PDFs, documents up to 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
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
    } else {
      cb(new Error('Invalid file type. Supported types: images, PDFs, text documents.'));
    }
  },
});

// ── GET /api/announcements (List announcements) ──────────────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const role = (req.user?.role as 'student' | 'admin' | 'staff') || 'student';
    const { status, category, priority, search } = req.query;

    const list = await AnnouncementsService.listAnnouncements({
      role,
      userId: req.user?.id,
      status: status as string,
      category: category as string,
      priority: priority as string,
      search: search as string,
    });

    return res.json({ announcements: list });
  } catch (err: any) {
    console.error('Failed to list announcements:', err);
    return res.status(500).json({ error: 'Failed to fetch announcements.' });
  }
});

// ── GET /api/announcements/stats (Admin analytics) ───────────────────────────
router.get('/stats', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const isDemo = isDemoUser(req.user);
    const stats = await AnnouncementsService.getAnalyticsOverview(isDemo);
    return res.json(stats);
  } catch (err: any) {
    console.error('Failed to fetch announcement stats:', err);
    return res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// ── GET /api/announcements/:id (Single details + record read for students) ───
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const announcement = await AnnouncementsService.getById(req.params.id, req.user?.id);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    // If student, check if published
    if (req.user?.role === 'student' && announcement.status !== 'published') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Record read status for student
    if (req.user?.role === 'student' && req.user?.id) {
      await AnnouncementsService.recordRead(announcement.id, req.user.id);
      announcement.has_read = true;
    }

    return res.json({ announcement });
  } catch (err: any) {
    console.error('Failed to fetch announcement detail:', err);
    return res.status(500).json({ error: 'Failed to fetch announcement.' });
  }
});

// ── POST /api/announcements (Create draft or publish) ───────────────────────
router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      message,
      category = 'General',
      priority = 'normal',
      status = 'draft',
      attachment_url,
      attachment_name,
      attachment_type,
      attachment_size,
      published_at,
      expires_at,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const created = await AnnouncementsService.createAnnouncement({
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
  } catch (err: any) {
    console.error('Failed to create announcement:', err);
    return res.status(500).json({ error: 'Failed to create announcement.' });
  }
});

// ── PATCH /api/announcements/:id (Update announcement) ───────────────────────
router.patch('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await AnnouncementsService.updateAnnouncement(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }
    return res.json({ success: true, announcement: updated });
  } catch (err: any) {
    console.error('Failed to update announcement:', err);
    return res.status(500).json({ error: 'Failed to update announcement.' });
  }
});

// ── POST /api/announcements/:id/publish (Publish to all students) ────────────
router.post('/:id/publish', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const published = await AnnouncementsService.publishAnnouncement(req.params.id);
    if (!published) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    return res.json({
      success: true,
      announcement: published,
      message: 'Announcement published successfully to all active students.',
    });
  } catch (err: any) {
    console.error('Failed to publish announcement:', err);
    return res.status(500).json({ error: 'Failed to publish announcement.' });
  }
});

// ── DELETE /api/announcements/:id (Delete announcement) ──────────────────────
router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const success = await AnnouncementsService.deleteAnnouncement(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }
    return res.json({ success: true, message: 'Announcement deleted successfully.' });
  } catch (err: any) {
    console.error('Failed to delete announcement:', err);
    return res.status(500).json({ error: 'Failed to delete announcement.' });
  }
});

// ── POST /api/announcements/upload (Upload announcement attachment) ───────────
router.post('/upload', requireAdmin, upload.single('attachment'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No attachment file uploaded.' });
    }

    const ext = req.file.originalname.split('.').pop() || 'file';
    const filename = `announcements/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;

    // Try uploading to Supabase Storage bucket 'announcement-attachments' or 'complaint-photos'
    let publicUrl: string | null = null;
    try {
      const { error: uploadErr } = await supabase.storage
        .from('announcement-attachments')
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from('announcement-attachments')
          .getPublicUrl(filename);
        publicUrl = urlData.publicUrl;
      }
    } catch {
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
  } catch (err: any) {
    console.error('Attachment upload failed:', err);
    return res.status(500).json({ error: 'Failed to upload attachment.' });
  }
});

export default router;
