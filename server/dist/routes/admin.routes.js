"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../db/supabase");
const auth_middleware_1 = require("../middleware/auth.middleware");
const demo_1 = require("../utils/demo");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, auth_middleware_1.requireAdmin);
// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const isDemo = (0, demo_1.isDemoUser)(req.user);
        // Complaint counts by status
        const { data: complaints } = await supabase_1.supabase
            .from('complaints')
            .select('id, student_id, status, priority, category, created_at, resolved_at');
        let all = complaints || [];
        if (!isDemo) {
            all = all.filter(c => !(0, demo_1.isDummyComplaint)(c));
        }
        const total = all.length;
        const pending = all.filter(c => c.status === 'pending').length;
        const assigned = all.filter(c => c.status === 'assigned').length;
        const inProgress = all.filter(c => c.status === 'in_progress' || c.status === 'assigned').length;
        const resolved = all.filter(c => c.status === 'resolved').length;
        const reopened = all.filter(c => c.status === 'reopened').length;
        const rejected = all.filter(c => c.status === 'rejected').length;
        // Avg resolution time (days)
        const resolvedComplaints = all.filter(c => c.status === 'resolved' && c.resolved_at);
        const avgResolution = resolvedComplaints.length > 0
            ? resolvedComplaints.reduce((sum, c) => {
                const diff = new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime();
                return sum + diff / (1000 * 60 * 60 * 24);
            }, 0) / resolvedComplaints.length
            : 0;
        // Today's mess rating
        const today = new Date().toISOString().split('T')[0];
        const { data: todayReviews } = await supabase_1.supabase
            .from('mess_reviews')
            .select('rating, student_id')
            .eq('review_date', today);
        let reviews = todayReviews || [];
        if (!isDemo) {
            reviews = reviews.filter(r => !(0, demo_1.isDummyMessReview)(r));
        }
        const todayMessAvg = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        // Category stats
        const categoryCounts = {};
        all.forEach(c => {
            categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
        });
        const categoryStats = Object.entries(categoryCounts)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);
        // Priority stats
        const priorityStats = {
            urgent: all.filter(c => c.priority === 'urgent').length,
            medium: all.filter(c => c.priority === 'medium').length,
            normal: all.filter(c => c.priority === 'normal').length,
        };
        // Staff list
        const { data: staff } = await supabase_1.supabase
            .from('staff')
            .select('id, name, role, phone, specialization, employee_id')
            .eq('is_active', true);
        let staffList = staff || [];
        if (!isDemo) {
            staffList = staffList.filter(s => !(0, demo_1.isDummyStaff)(s));
        }
        // Student count
        let totalStudents = 0;
        if (isDemo) {
            const { count } = await supabase_1.supabase
                .from('profiles')
                .select('id', { count: 'exact', head: true })
                .eq('role', 'student');
            totalStudents = count || 0;
        }
        else {
            const { data: realStudents } = await supabase_1.supabase
                .from('profiles')
                .select('id, email')
                .eq('role', 'student');
            const filtered = (realStudents || []).filter(s => !(0, demo_1.isDummyStudent)(s));
            totalStudents = filtered.length;
        }
        return res.json({
            total,
            pending,
            assigned,
            in_progress: inProgress,
            resolved,
            reopened,
            rejected,
            avg_resolution_days: Math.round(avgResolution * 10) / 10,
            today_mess_avg: Math.round(todayMessAvg * 10) / 10,
            today_mess_count: reviews.length,
            category_stats: categoryStats,
            priority_stats: priorityStats,
            staff: staffList,
            total_students: totalStudents,
        });
    }
    catch (err) {
        console.error('Admin stats error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// GET /api/admin/students
router.get('/students', async (req, res) => {
    try {
        const isDemo = (0, demo_1.isDemoUser)(req.user);
        const { data: students } = await supabase_1.supabase
            .from('profiles')
            .select('id, name, email, student_id, role, room, hostel, block, phone, course, year, created_at')
            .eq('role', 'student')
            .order('name');
        if (!students)
            return res.json([]);
        let studentList = students;
        if (!isDemo) {
            studentList = studentList.filter(s => !(0, demo_1.isDummyStudent)(s));
        }
        // Get complaint counts
        const { data: complaintsData } = await supabase_1.supabase
            .from('complaints')
            .select('id, student_id');
        let validComplaints = complaintsData || [];
        if (!isDemo) {
            validComplaints = validComplaints.filter(c => !(0, demo_1.isDummyComplaint)(c));
        }
        const countMap = {};
        validComplaints.forEach(c => {
            countMap[c.student_id] = (countMap[c.student_id] || 0) + 1;
        });
        return res.json(studentList.map(s => ({
            ...s,
            complaint_count: countMap[s.id] || 0,
        })));
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error.' });
    }
});
// GET /api/admin/staff
router.get('/staff', async (req, res) => {
    try {
        const isDemo = (0, demo_1.isDemoUser)(req.user);
        const { data: staff } = await supabase_1.supabase
            .from('staff')
            .select('*')
            .eq('is_active', true)
            .order('name');
        let staffList = staff || [];
        if (!isDemo) {
            staffList = staffList.filter(s => !(0, demo_1.isDummyStaff)(s));
        }
        return res.json(staffList);
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error.' });
    }
});
// POST /api/admin/staff - add staff member
router.post('/staff', async (req, res) => {
    try {
        const { name, role, phone, specialization, employee_id, department } = req.body;
        if (!name || !role) {
            return res.status(400).json({ error: 'Staff name and role are required.' });
        }
        const newStaff = {
            name: name.trim(),
            role: role.trim(),
            phone: phone?.trim() || null,
            specialization: specialization?.trim() || null,
            employee_id: employee_id?.trim() || `EMP${Math.floor(1000 + Math.random() * 9000)}`,
            department: department?.trim() || (role === 'Cleaning Staff' ? 'Housekeeping' : 'Maintenance'),
            is_active: true,
        };
        const { data, error } = await supabase_1.supabase
            .from('staff')
            .insert(newStaff)
            .select()
            .single();
        if (error || !data) {
            return res.status(500).json({ error: error?.message || 'Failed to add staff member.' });
        }
        return res.status(201).json(data);
    }
    catch (err) {
        console.error('Error adding staff:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// DELETE /api/admin/staff/:id - delete or deactivate staff member
router.delete('/staff/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Try hard delete first; if foreign key constraint prevents it, soft-delete
        const { error: delError } = await supabase_1.supabase
            .from('staff')
            .delete()
            .eq('id', id);
        if (delError) {
            const { error: softError } = await supabase_1.supabase
                .from('staff')
                .update({ is_active: false })
                .eq('id', id);
            if (softError) {
                return res.status(500).json({ error: 'Failed to delete staff member.' });
            }
        }
        return res.json({ success: true, message: 'Staff member removed successfully.' });
    }
    catch (err) {
        console.error('Error deleting staff:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// PATCH /api/admin/complaints/:id/assign
router.patch('/complaints/:id/assign', async (req, res) => {
    try {
        const { assigned_staff_id, assigned_staff_name } = req.body;
        const { data: complaint } = await supabase_1.supabase
            .from('complaints')
            .select('*')
            .eq('id', req.params.id)
            .single();
        if (!complaint)
            return res.status(404).json({ error: 'Complaint not found.' });
        const now = new Date().toISOString();
        const { data: updated, error } = await supabase_1.supabase
            .from('complaints')
            .update({
            status: 'assigned',
            assigned_staff_id: assigned_staff_id || null,
            assigned_staff_name: assigned_staff_name || null,
            assigned_by: req.user.id,
            assigned_at: now,
        })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error || !updated)
            return res.status(500).json({ error: 'Failed to assign staff.' });
        // Status history
        await supabase_1.supabase.from('complaint_status_history').insert({
            complaint_id: complaint.id,
            old_status: complaint.status,
            new_status: 'assigned',
            changed_by_name: req.user.name,
            note: `Assigned to ${assigned_staff_name || 'staff'}`,
        });
        // Notify student
        await supabase_1.supabase.from('notifications').insert({
            user_id: complaint.student_id,
            title: 'Complaint Assigned 👨‍🔧',
            message: `Your complaint ${complaint.complaint_number} has been assigned to ${assigned_staff_name || 'our maintenance team'}.`,
            type: 'complaint',
            related_complaint_id: complaint.id,
            is_read: false,
        });
        return res.json({ ...updated, complaint_id: updated.complaint_number });
    }
    catch (err) {
        console.error('Assign error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
exports.default = router;
