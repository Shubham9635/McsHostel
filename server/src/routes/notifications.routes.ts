import { Router, Response } from 'express';
import { supabase } from '../db/supabase';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { notificationStreamService } from '../services/notification-stream.service';

const router = Router();
router.use(authenticate);

// In-memory fallback for user notification preferences if not in DB column
const userPreferencesCache: Record<string, {
  complaints: boolean;
  safety: boolean;
  mess: boolean;
  system: boolean;
  sound: boolean;
}> = {};

// Helper to determine rich related_type and related_id
function parseNotificationDetails(n: any) {
  let related_type: 'complaint' | 'safety_report' | 'mess' | 'announcement' | 'system' = 'system';
  let related_id = n.related_complaint_id || n.related_id || null;
  const lowerTitle = (n.title || '').toLowerCase();
  const lowerMsg = (n.message || '').toLowerCase();

  if (n.type === 'announcement' || lowerTitle.includes('📢') || lowerTitle.includes('announcement') || n.related_type === 'announcement') {
    related_type = 'announcement';
    if (n.related_id) related_id = n.related_id;
  } else if (n.type === 'complaint' || lowerTitle.includes('complaint') || n.related_complaint_id) {
    related_type = 'complaint';
  } else if (n.type === 'mess' || lowerTitle.includes('mess') || lowerTitle.includes('meal')) {
    related_type = 'mess';
  } else if (lowerTitle.includes('safety') || lowerTitle.includes('ragging') || lowerMsg.includes('hr-')) {
    related_type = 'safety_report';
    // Try extracting tracking ID if present
    const match = n.message?.match(/HR-\d{4}-\d+/i);
    if (match) {
      related_id = match[0];
    }
  }

  const priority = (n.title?.includes('URGENT') || n.title?.includes('🔴'))
    ? 'urgent'
    : (n.title?.includes('IMPORTANT') || n.title?.includes('🟠'))
    ? 'important'
    : (n.priority || 'normal');

  return {
    ...n,
    recipient_user_id: n.user_id,
    read: n.is_read, // backward compat alias
    related_type,
    related_id,
    priority,
  };
}

// ── GET /api/notifications/stream (Real-Time SSE Stream) ─────────────────────
router.get('/stream', (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  notificationStreamService.addClient(req.user.id, res);
});

// ── GET /api/notifications ──────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { type, unread_only, page = '1', limit = '50' } = req.query;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (unread_only === 'true') {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query;
    if (error) return res.status(500).json({ error: 'Failed to fetch notifications.' });

    let notifs = (notifications || []).map(parseNotificationDetails);

    // Filter by category if requested
    if (type && type !== 'all') {
      notifs = notifs.filter(n => n.related_type === type || n.type === type);
    }

    // Pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = notifs.slice(startIndex, startIndex + limitNum);

    const unread = (notifications || []).filter(n => !n.is_read).length;
    return res.json({
      notifications: paginated,
      total: notifs.length,
      page: pageNum,
      unread,
    });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// ── PATCH /api/notifications/read-all ───────────────────────────────────────
router.patch('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user!.id)
      .eq('is_read', false);

    if (error) return res.status(500).json({ error: 'Failed to mark notifications as read.' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

// ── PATCH /api/notifications/:id/read ───────────────────────────────────────
router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);

    if (error) return res.status(404).json({ error: 'Notification not found.' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.' });
  }
});

// ── GET /api/notifications/settings ─────────────────────────────────────────
router.get('/settings', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const defaults = {
    complaints: true,
    safety: true, // Always true & locked for critical security
    mess: true,
    system: true,
    sound: false,
  };

  const prefs = userPreferencesCache[userId] || defaults;
  return res.json(prefs);
});

// ── PATCH /api/notifications/settings ───────────────────────────────────────
router.patch('/settings', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const current = userPreferencesCache[userId] || {
    complaints: true,
    safety: true,
    mess: true,
    system: true,
    sound: false,
  };

  userPreferencesCache[userId] = {
    ...current,
    ...req.body,
    safety: true, // Critical safety alerts cannot be disabled per institutional safety policy
  };

  return res.json(userPreferencesCache[userId]);
});

export default router;
