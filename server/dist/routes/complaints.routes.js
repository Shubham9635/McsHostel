"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../db/supabase");
const auth_middleware_1 = require("../middleware/auth.middleware");
const notification_service_1 = require("../services/notification.service");
const demo_1 = require("../utils/demo");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Generate a unique complaint number HH-YYYY-NNNNN
async function generateComplaintNumber() {
    const year = new Date().getFullYear();
    const prefix = `HH-${year}-`;
    // Get the highest existing number for this year
    const { data, error } = await supabase_1.supabase
        .from('complaints')
        .select('complaint_number')
        .like('complaint_number', `${prefix}%`)
        .order('complaint_number', { ascending: false })
        .limit(1);
    let nextNum = 100;
    if (!error && data && data.length > 0) {
        const lastNum = parseInt(data[0].complaint_number.split('-')[2], 10);
        if (!isNaN(lastNum))
            nextNum = lastNum + 1;
    }
    return `${prefix}${String(nextNum).padStart(5, '0')}`;
}
// Add a notification helper via centralized real-time NotificationService
async function addNotification(userId, title, message, type, relatedComplaintId, priority = 'normal') {
    return notification_service_1.NotificationService.createNotification({
        recipient_user_id: userId,
        title,
        message,
        type,
        related_type: 'complaint',
        related_id: relatedComplaintId || null,
        priority,
    });
}
// Add a status history record
async function addStatusHistory(complaintId, oldStatus, newStatus, changedByName, note) {
    await supabase_1.supabase.from('complaint_status_history').insert({
        complaint_id: complaintId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by_name: changedByName,
        note: note || null,
    });
}
// GET /api/complaints
router.get('/', async (req, res) => {
    try {
        const { status, category, hostel, priority, search, sort } = req.query;
        const isDemo = (0, demo_1.isDemoUser)(req.user);
        let query = supabase_1.supabase
            .from('complaints')
            .select(`
        *,
        profiles:student_id ( name, email, student_id, room, hostel, phone ),
        complaint_feedback ( id, solved, rating, comment, created_at )
      `);
        // Students only see their own complaints
        if (req.user.role === 'student') {
            if (isDemo) {
                query = query.or(`student_id.eq.${req.user.id},student_id.eq.${demo_1.SEED_STUDENT_ID}`);
            }
            else {
                query = query.eq('student_id', req.user.id);
            }
        }
        if (status && status !== 'all')
            query = query.eq('status', status);
        if (category && category !== 'all')
            query = query.eq('category', category);
        if (hostel && hostel !== 'all')
            query = query.eq('hostel', hostel);
        if (priority && priority !== 'all')
            query = query.eq('priority', priority);
        const order = sort === 'oldest' ? { ascending: true } : { ascending: false };
        query = query.order('created_at', order);
        const { data, error } = await query;
        if (error) {
            console.error('Get complaints error:', error);
            return res.status(500).json({ error: 'Failed to fetch complaints.' });
        }
        let results = data || [];
        // Filter out dummy complaints for all real (non-demo) users
        if (!isDemo) {
            results = results.filter((c) => !(0, demo_1.isDummyComplaint)(c));
        }
        // Text search (done in JS since Supabase free tier has limited FTS)
        if (search) {
            const s = search.toLowerCase();
            results = results.filter((c) => c.title?.toLowerCase().includes(s) ||
                c.complaint_number?.toLowerCase().includes(s) ||
                c.description?.toLowerCase().includes(s) ||
                c.room?.toLowerCase().includes(s));
        }
        // Flatten profile and feedback for frontend compatibility
        const enriched = results.map((c) => ({
            ...c,
            complaint_id: c.complaint_number, // backwards compat alias
            assigned_at: c.assigned_at,
            started_at: c.started_at,
            student_name: c.profiles?.name || 'Unknown',
            student_email: c.profiles?.email || null,
            feedback: c.complaint_feedback?.[0] || null,
            profiles: undefined,
            complaint_feedback: undefined,
        }));
        return res.json(enriched);
    }
    catch (err) {
        console.error('Get complaints error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// GET /api/complaints/:id
router.get('/:id', async (req, res) => {
    try {
        const isDemo = (0, demo_1.isDemoUser)(req.user);
        const { data: complaint, error } = await supabase_1.supabase
            .from('complaints')
            .select(`
        *,
        profiles:student_id ( name, email, student_id, room, hostel, phone ),
        complaint_feedback ( id, solved, rating, comment, created_at )
      `)
            .or(`id.eq.${req.params.id},complaint_number.eq.${req.params.id}`)
            .single();
        if (error || !complaint)
            return res.status(404).json({ error: 'Complaint not found.' });
        // Non-demo users cannot view dummy complaints
        if (!isDemo && (0, demo_1.isDummyComplaint)(complaint)) {
            return res.status(404).json({ error: 'Complaint not found.' });
        }
        if (req.user.role === 'student') {
            if (isDemo) {
                if (complaint.student_id !== req.user.id && complaint.student_id !== demo_1.SEED_STUDENT_ID) {
                    return res.status(403).json({ error: 'Access denied.' });
                }
            }
            else if (complaint.student_id !== req.user.id) {
                return res.status(403).json({ error: 'Access denied.' });
            }
        }
        return res.json({
            ...complaint,
            complaint_id: complaint.complaint_number,
            student_name: complaint.profiles?.name || 'Unknown',
            student_email: complaint.profiles?.email,
            feedback: complaint.complaint_feedback?.[0] || null,
            profiles: undefined,
            complaint_feedback: undefined,
        });
    }
    catch (err) {
        console.error('Get complaint error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// GET /api/complaints/:id/history
router.get('/:id/history', async (req, res) => {
    try {
        // First verify access
        const { data: complaint } = await supabase_1.supabase
            .from('complaints')
            .select('id, student_id')
            .or(`id.eq.${req.params.id},complaint_number.eq.${req.params.id}`)
            .single();
        if (!complaint)
            return res.status(404).json({ error: 'Complaint not found.' });
        if (req.user.role === 'student' && complaint.student_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied.' });
        }
        const { data: history, error } = await supabase_1.supabase
            .from('complaint_status_history')
            .select('*')
            .eq('complaint_id', complaint.id)
            .order('created_at', { ascending: true });
        if (error)
            return res.status(500).json({ error: 'Failed to fetch history.' });
        return res.json(history || []);
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error.' });
    }
});
// POST /api/complaints
router.post('/', async (req, res) => {
    try {
        const { category, title, description, room, hostel, location, priority, photo_url } = req.body;
        if (!category || !title?.trim() || !description?.trim() || !room?.trim() || !hostel) {
            return res.status(400).json({ error: 'Required fields: category, title, description, room, hostel.' });
        }
        const complaintNumber = await generateComplaintNumber();
        const { data: complaint, error } = await supabase_1.supabase
            .from('complaints')
            .insert({
            complaint_number: complaintNumber,
            student_id: req.user.id,
            category,
            title: title.trim(),
            description: description.trim(),
            photo_url: photo_url || null,
            room: room.trim(),
            hostel,
            location: location?.trim() || room.trim(),
            priority: priority || 'normal',
            status: 'pending',
        })
            .select()
            .single();
        if (error || !complaint) {
            console.error('Create complaint error:', error);
            return res.status(500).json({ error: 'Failed to submit complaint.' });
        }
        // Add initial status history
        await addStatusHistory(complaint.id, null, 'pending', 'System', 'Complaint submitted by student');
        // Notify student
        await addNotification(req.user.id, 'Complaint Submitted ✅', `Your complaint ${complaintNumber} (${complaint.title}) has been submitted successfully. We'll assign a technician shortly.`, 'complaint', complaint.id);
        // Notify authorized management/admins in real time
        await notification_service_1.NotificationService.notifyAdmins({
            title: '🔧 New Complaint Received',
            message: `New maintenance complaint submitted.\nCategory: ${complaint.category} | Location: ${complaint.hostel} - ${complaint.room} | Priority: ${complaint.priority || 'Normal'}`,
            type: 'complaint',
            related_type: 'complaint',
            related_id: complaint.id,
            priority: complaint.priority === 'urgent' ? 'urgent' : 'normal',
        });
        return res.status(201).json({ ...complaint, complaint_id: complaint.complaint_number });
    }
    catch (err) {
        console.error('Create complaint error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// PATCH /api/complaints/:id/status — admin/staff only
router.patch('/:id/status', async (req, res) => {
    if (!['admin', 'super_admin', 'staff'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Admin or staff only.' });
    }
    try {
        const { data: complaint } = await supabase_1.supabase
            .from('complaints')
            .select('*')
            .eq('id', req.params.id)
            .single();
        if (!complaint)
            return res.status(404).json({ error: 'Complaint not found.' });
        const { status, assigned_staff_id, assigned_staff_name, resolution_note } = req.body;
        const now = new Date().toISOString();
        const updates = { status };
        if (status === 'assigned') {
            updates.assigned_at = now;
            updates.assigned_staff_id = assigned_staff_id || null;
            updates.assigned_staff_name = assigned_staff_name || null;
            updates.assigned_by = req.user.id;
        }
        else if (status === 'in_progress') {
            updates.started_at = now;
        }
        else if (status === 'resolved') {
            updates.resolved_at = now;
            updates.resolved_by = req.user.id;
            updates.resolution_note = resolution_note || null;
        }
        else if (status === 'reopened') {
            updates.resolved_at = null;
        }
        const { data: updated, error } = await supabase_1.supabase
            .from('complaints')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();
        if (error || !updated)
            return res.status(500).json({ error: 'Failed to update status.' });
        // Status history
        await addStatusHistory(complaint.id, complaint.status, status, req.user.name, resolution_note || undefined);
        // Notify student
        const notifMessages = {
            assigned: {
                title: 'Complaint Assigned 👨‍🔧',
                msg: `Your complaint ${complaint.complaint_number} has been assigned to ${assigned_staff_name || 'staff'}.`,
            },
            in_progress: {
                title: 'Work In Progress 🔧',
                msg: `Work has started on your complaint ${complaint.complaint_number}. Our team is on it!`,
            },
            resolved: {
                title: 'Complaint Resolved ✅',
                msg: `Your complaint ${complaint.complaint_number} (${complaint.title}) has been resolved! Please verify and give feedback.`,
            },
            reopened: {
                title: 'Complaint Reopened 🔁',
                msg: `Your complaint ${complaint.complaint_number} has been reopened and assigned for further attention.`,
            },
            rejected: {
                title: 'Complaint Closed',
                msg: `Your complaint ${complaint.complaint_number} has been closed. Please contact management if this is an error.`,
            },
        };
        if (notifMessages[status]) {
            await addNotification(complaint.student_id, notifMessages[status].title, notifMessages[status].msg, 'complaint', complaint.id);
        }
        // If assigned to a staff user, notify the staff member
        if (status === 'assigned' && assigned_staff_id) {
            await notification_service_1.NotificationService.notifyStaff(assigned_staff_id, {
                title: '🔧 New Complaint Assigned',
                message: `Complaint ${complaint.complaint_number} (${complaint.title}) has been assigned to you.`,
                type: 'complaint',
                related_type: 'complaint',
                related_id: complaint.id,
            });
        }
        return res.json({ ...updated, complaint_id: updated.complaint_number });
    }
    catch (err) {
        console.error('Update status error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// POST /api/complaints/:id/feedback
router.post('/:id/feedback', async (req, res) => {
    try {
        const { data: complaint } = await supabase_1.supabase
            .from('complaints')
            .select('id, student_id, complaint_number, title')
            .eq('id', req.params.id)
            .single();
        if (!complaint)
            return res.status(404).json({ error: 'Complaint not found.' });
        if (complaint.student_id !== req.user.id)
            return res.status(403).json({ error: 'Access denied.' });
        const { solved, rating, comment } = req.body;
        // Upsert feedback
        const { error: feedbackError } = await supabase_1.supabase
            .from('complaint_feedback')
            .upsert({
            complaint_id: complaint.id,
            student_id: req.user.id,
            solved: !!solved,
            rating: rating || null,
            comment: comment || null,
        }, { onConflict: 'complaint_id' });
        if (feedbackError) {
            console.error('Feedback error:', feedbackError);
            return res.status(500).json({ error: 'Failed to submit feedback.' });
        }
        // If NOT solved, reopen the complaint
        if (!solved) {
            await supabase_1.supabase
                .from('complaints')
                .update({ status: 'reopened', resolved_at: null })
                .eq('id', complaint.id);
            await addStatusHistory(complaint.id, 'resolved', 'reopened', req.user.name, 'Student reported the issue is not resolved');
            // Notify admin (all admins) — simplified: insert one notification for each admin
            const { data: admins } = await supabase_1.supabase
                .from('profiles')
                .select('id')
                .in('role', ['admin', 'super_admin']);
            if (admins) {
                for (const admin of admins) {
                    await addNotification(admin.id, 'Complaint Reopened 🔁', `Complaint ${complaint.complaint_number} (${complaint.title}) has been reopened — student says issue persists.`, 'complaint', complaint.id);
                }
            }
        }
        return res.json({ success: true, reopened: !solved });
    }
    catch (err) {
        console.error('Feedback error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
exports.default = router;
