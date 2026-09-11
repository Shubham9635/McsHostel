"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../db/supabase");
const auth_middleware_1 = require("../middleware/auth.middleware");
const notification_service_1 = require("../services/notification.service");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Generate unique tracking ID: HR-YYYY-NNNNN (e.g. HR-2026-00421)
async function generateTrackingId() {
    const year = new Date().getFullYear();
    const prefix = `HR-${year}-`;
    try {
        const { data } = await supabase_1.supabase
            .from('safety_reports')
            .select('tracking_id')
            .like('tracking_id', `${prefix}%`)
            .order('tracking_id', { ascending: false })
            .limit(1);
        let nextNum = 421;
        if (data && data.length > 0 && data[0].tracking_id) {
            const parts = data[0].tracking_id.split('-');
            if (parts.length === 3) {
                const parsed = parseInt(parts[2], 10);
                if (!isNaN(parsed))
                    nextNum = parsed + 1;
            }
        }
        return `${prefix}${String(nextNum).padStart(5, '0')}`;
    }
    catch {
        const fallback = Math.floor(10000 + Math.random() * 90000);
        return `${prefix}${fallback}`;
    }
}
// Student: Submit new safety report
router.post('/reports', auth_middleware_1.requireStudent, async (req, res) => {
    try {
        const { incident_type, severity = 'Normal', is_immediate_danger = false, description, hostel, block = '', floor = '', location = '', incident_date = new Date().toISOString().split('T')[0], incident_time = new Date().toTimeString().slice(0, 5), } = req.body;
        if (!incident_type || !incident_type.trim()) {
            return res.status(400).json({ error: 'Please select an incident type.' });
        }
        if (!description || !description.trim()) {
            return res.status(400).json({ error: 'Please describe what happened.' });
        }
        if (!hostel || !hostel.trim()) {
            return res.status(400).json({ error: 'Please select the hostel location.' });
        }
        const trackingId = await generateTrackingId();
        const priority = is_immediate_danger || severity === 'Urgent' ? 'Urgent' : (severity === 'Serious' ? 'Medium' : 'Normal');
        const { data: report, error } = await supabase_1.supabase
            .from('safety_reports')
            .insert({
            tracking_id: trackingId,
            incident_type: incident_type.trim(),
            severity,
            is_immediate_danger: !!is_immediate_danger,
            description: description.trim(),
            hostel: hostel.trim(),
            block: block ? block.trim() : null,
            floor: floor ? floor.trim() : null,
            location: location ? location.trim() : null,
            incident_date,
            incident_time,
            status: 'Submitted',
            priority,
            reporter_user_id: req.user.id, // Internal audit only; NEVER exposed in admin UI
        })
            .select()
            .single();
        if (error || !report) {
            console.error('Safety report insert error:', error);
            return res.status(500).json({ error: 'Failed to submit safety report.' });
        }
        // Record initial status history
        try {
            await supabase_1.supabase.from('safety_report_history').insert({
                report_id: report.id,
                old_status: 'None',
                new_status: 'Submitted',
                changed_by_name: 'Anonymous Student',
                note: is_immediate_danger ? 'Report marked with immediate danger warning' : 'Safety report submitted by student',
            });
        }
        catch (hErr) {
            console.error('Failed to create safety report history:', hErr);
        }
        // Send confirmation notification to student
        try {
            await notification_service_1.NotificationService.notifyStudent(req.user.id, {
                title: '🛡️ Safety Report Submitted',
                message: `Your safety report (${trackingId}) has been securely submitted. Your identity stays protected.`,
                type: 'info',
                related_type: 'safety_report',
                related_id: trackingId,
            });
        }
        catch (nErr) {
            console.error('Failed to notify student:', nErr);
        }
        // Notify all admins about the new report in real time (IDENTITY IS STRICTLY PROTECTED)
        try {
            await notification_service_1.NotificationService.notifyAdmins({
                title: is_immediate_danger ? '🔴 URGENT SAFETY REPORT' : '🛡️ New Safety Report',
                message: is_immediate_danger
                    ? `An urgent safety report (${trackingId} - ${incident_type.trim()}) requires immediate review.`
                    : `An anonymous safety report (${trackingId} - ${incident_type.trim()}) requires review.`,
                type: 'info',
                related_type: 'safety_report',
                related_id: report.id,
                priority: is_immediate_danger ? 'urgent' : 'normal',
            });
        }
        catch (aErr) {
            console.error('Failed to notify admins:', aErr);
        }
        // Explicitly sanitize output: reporter_user_id is omitted
        const { reporter_user_id, ...safeReport } = report;
        return res.status(201).json(safeReport);
    }
    catch (err) {
        console.error('Safety report submission error:', err);
        return res.status(500).json({ error: 'Server error during safety report submission.' });
    }
});
// Student: Fetch own submitted safety reports
router.get('/reports/my', auth_middleware_1.requireStudent, async (req, res) => {
    try {
        const { data: reports, error } = await supabase_1.supabase
            .from('safety_reports')
            .select('id, tracking_id, incident_type, severity, is_immediate_danger, description, hostel, block, floor, location, incident_date, incident_time, status, priority, created_at, updated_at')
            .eq('reporter_user_id', req.user.id)
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Fetch my safety reports error:', error);
            return res.status(500).json({ error: 'Failed to fetch your safety reports.' });
        }
        return res.json(reports || []);
    }
    catch (err) {
        console.error('My safety reports server error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// Student: Fetch single report status and timeline
router.get('/reports/:id/status', auth_middleware_1.requireStudent, async (req, res) => {
    try {
        const { data: report, error } = await supabase_1.supabase
            .from('safety_reports')
            .select('id, tracking_id, incident_type, severity, status, created_at, updated_at, reporter_user_id')
            .or(`id.eq.${req.params.id},tracking_id.eq.${req.params.id}`)
            .single();
        if (error || !report)
            return res.status(404).json({ error: 'Report not found.' });
        if (report.reporter_user_id !== req.user.id)
            return res.status(403).json({ error: 'Access denied.' });
        const { data: history } = await supabase_1.supabase
            .from('safety_report_history')
            .select('id, old_status, new_status, changed_by_name, note, created_at')
            .eq('report_id', report.id)
            .order('created_at', { ascending: true });
        const { reporter_user_id, ...safeReport } = report;
        return res.json({ ...safeReport, history: history || [] });
    }
    catch (err) {
        console.error('Safety status fetch error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// Admin: Real statistics from database (NO hardcoded stats)
router.get('/admin/stats', auth_middleware_1.requireAdmin, async (_req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('safety_reports')
            .select('status, severity, is_immediate_danger');
        if (error) {
            console.error('Safety stats fetch error:', error);
            return res.status(500).json({ error: 'Failed to fetch statistics.' });
        }
        const records = data || [];
        const total = records.length;
        const new_reports = records.filter(r => r.status === 'Submitted' || r.status === 'new').length;
        const under_review = records.filter(r => r.status === 'Under Review' || r.status === 'under_review').length;
        const investigation = records.filter(r => r.status === 'Investigation in Progress' || r.status === 'investigation').length;
        const resolved = records.filter(r => r.status === 'Resolved' || r.status === 'resolved').length;
        const closed = records.filter(r => r.status === 'Closed' || r.status === 'closed').length;
        const urgent = records.filter(r => r.severity === 'Urgent' || r.is_immediate_danger).length;
        return res.json({
            total,
            new_reports,
            under_review,
            investigation,
            resolved,
            closed,
            urgent,
        });
    }
    catch (err) {
        console.error('Safety stats server error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// Admin: List all reports with search and filters (reporter_user_id strictly stripped)
router.get('/admin/reports', auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const { status, severity, hostel, search } = req.query;
        let query = supabase_1.supabase
            .from('safety_reports')
            .select('id, tracking_id, incident_type, severity, is_immediate_danger, description, hostel, block, floor, location, incident_date, incident_time, status, priority, internal_notes, created_at, updated_at')
            .order('created_at', { ascending: false });
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }
        if (severity && severity !== 'all') {
            query = query.eq('severity', severity);
        }
        if (hostel && hostel !== 'all') {
            query = query.eq('hostel', hostel);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Admin safety reports fetch error:', error);
            return res.status(500).json({ error: 'Failed to load safety reports.' });
        }
        let results = data || [];
        if (search) {
            const s = String(search).toLowerCase();
            results = results.filter(r => r.tracking_id?.toLowerCase().includes(s) ||
                r.incident_type?.toLowerCase().includes(s) ||
                r.description?.toLowerCase().includes(s) ||
                r.hostel?.toLowerCase().includes(s) ||
                r.location?.toLowerCase().includes(s));
        }
        // Fetch evidence count for each report
        const enriched = await Promise.all(results.map(async (r) => {
            const { count } = await supabase_1.supabase
                .from('safety_report_evidence')
                .select('*', { count: 'exact', head: true })
                .eq('report_id', r.id);
            return {
                ...r,
                evidence_count: count || 0,
                reporter: 'Anonymous Reporter',
                identity_status: 'Identity Protected',
            };
        }));
        return res.json(enriched);
    }
    catch (err) {
        console.error('Admin safety fetch error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// Admin: Fetch single report details with history and evidence count
router.get('/admin/reports/:id', auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const { data: report, error } = await supabase_1.supabase
            .from('safety_reports')
            .select('id, tracking_id, incident_type, severity, is_immediate_danger, description, hostel, block, floor, location, incident_date, incident_time, status, priority, internal_notes, created_at, updated_at')
            .eq('id', req.params.id)
            .single();
        if (error || !report)
            return res.status(404).json({ error: 'Report not found.' });
        const { data: history } = await supabase_1.supabase
            .from('safety_report_history')
            .select('id, old_status, new_status, changed_by_name, note, created_at')
            .eq('report_id', report.id)
            .order('created_at', { ascending: true });
        const { data: evidence } = await supabase_1.supabase
            .from('safety_report_evidence')
            .select('id, storage_path, file_name, file_type, file_size, created_at')
            .eq('report_id', report.id);
        return res.json({
            ...report,
            reporter: 'Anonymous Reporter',
            identity_status: 'Identity Protected',
            history: history || [],
            evidence: evidence || [],
        });
    }
    catch (err) {
        console.error('Admin report detail error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// Admin: Update status / priority / internal notes
router.patch('/admin/reports/:id/status', auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const { status, priority, note } = req.body;
        if (!status && !priority && note === undefined) {
            return res.status(400).json({ error: 'No update data provided.' });
        }
        const { data: current, error: fetchErr } = await supabase_1.supabase
            .from('safety_reports')
            .select('id, tracking_id, status, priority, internal_notes, reporter_user_id')
            .eq('id', req.params.id)
            .single();
        if (fetchErr || !current)
            return res.status(404).json({ error: 'Report not found.' });
        const updates = { updated_at: new Date().toISOString() };
        if (status)
            updates.status = status;
        if (priority)
            updates.priority = priority;
        if (note !== undefined)
            updates.internal_notes = note;
        const { data: updated, error: updErr } = await supabase_1.supabase
            .from('safety_reports')
            .update(updates)
            .eq('id', req.params.id)
            .select('id, tracking_id, incident_type, severity, is_immediate_danger, description, hostel, block, floor, location, incident_date, incident_time, status, priority, internal_notes, created_at, updated_at')
            .single();
        if (updErr || !updated) {
            console.error('Safety status update error:', updErr);
            return res.status(500).json({ error: 'Failed to update report status.' });
        }
        // Insert history record if status changed or note added
        if (status && status !== current.status) {
            await supabase_1.supabase.from('safety_report_history').insert({
                report_id: req.params.id,
                old_status: current.status,
                new_status: status,
                changed_by_name: req.user.name || 'Hostel Management',
                note: note || `Status updated to ${status}`,
            });
            // Notify student safely (INTERNAL INVESTIGATION NOTES ARE NEVER EXPOSED)
            if (current.reporter_user_id) {
                const statusLabels = {
                    'Under Review': 'Your safety report is now under review.',
                    'Investigation in Progress': 'Your safety report investigation has been updated.',
                    'Resolved': 'Your safety report has been resolved.',
                    'Closed': 'Your safety report has been closed.',
                };
                const notifMsg = statusLabels[status] || `Your safety report status has been updated to ${status}.`;
                notification_service_1.NotificationService.notifyStudent(current.reporter_user_id, {
                    title: '🛡️ Safety Report Updated',
                    message: `${notifMsg} (Ref: ${current.tracking_id || 'Safety Report'})`,
                    type: 'info',
                    related_type: 'safety_report',
                    related_id: current.tracking_id || current.id,
                }).catch(err => console.error('Failed to notify student of safety update:', err));
            }
        }
        return res.json({
            ...updated,
            reporter: 'Anonymous Reporter',
            identity_status: 'Identity Protected',
        });
    }
    catch (err) {
        console.error('Admin status patch error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// Admin: Generate secure signed URLs for evidence files
router.get('/admin/reports/:id/evidence', auth_middleware_1.requireAdmin, async (req, res) => {
    try {
        const { data: evidence, error } = await supabase_1.supabase
            .from('safety_report_evidence')
            .select('id, storage_path, file_name, file_type, file_size, created_at')
            .eq('report_id', req.params.id);
        if (error) {
            console.error('Fetch evidence error:', error);
            return res.status(500).json({ error: 'Failed to load evidence metadata.' });
        }
        const signedList = await Promise.all((evidence || []).map(async (ev) => {
            let signedUrl = null;
            try {
                const { data } = await supabase_1.supabase.storage
                    .from('safety-evidence')
                    .createSignedUrl(ev.storage_path, 600); // 10 minute temporary signed access
                signedUrl = data?.signedUrl || null;
            }
            catch (sErr) {
                console.error('Failed to create signed URL for', ev.storage_path, sErr);
            }
            return {
                id: ev.id,
                file_name: ev.file_name,
                file_type: ev.file_type,
                file_size: ev.file_size,
                signed_url: signedUrl,
            };
        }));
        return res.json(signedList);
    }
    catch (err) {
        console.error('Evidence signed URL generation error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
exports.default = router;
