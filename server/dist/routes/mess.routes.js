"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../db/supabase");
const auth_middleware_1 = require("../middleware/auth.middleware");
const notification_service_1 = require("../services/notification.service");
const demo_1 = require("../utils/demo");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// GET /api/mess/reviews
router.get('/reviews', async (req, res) => {
    try {
        const { date, meal_type, my_only } = req.query;
        const isDemo = (0, demo_1.isDemoUser)(req.user);
        let query = supabase_1.supabase
            .from('mess_reviews')
            .select(`*, profiles:student_id ( name, email )`)
            .order('created_at', { ascending: false });
        if (date)
            query = query.eq('review_date', date);
        if (meal_type)
            query = query.eq('meal_type', meal_type);
        if (my_only === 'true')
            query = query.eq('student_id', req.user.id);
        const { data, error } = await query;
        if (error) {
            console.error('Get reviews error:', error);
            return res.status(500).json({ error: 'Failed to fetch reviews.' });
        }
        let enriched = (data || []).map((r) => ({
            ...r,
            review: r.review_text, // backward compat alias
            date: r.review_date, // backward compat alias
            student_name: r.anonymous ? 'Anonymous' : (r.profiles?.name || 'Student'),
            is_own: r.student_id === req.user.id,
            profiles: undefined,
        }));
        if (!isDemo) {
            enriched = enriched.filter((r) => !(0, demo_1.isDummyMessReview)(r));
        }
        return res.json(enriched);
    }
    catch (err) {
        console.error('Get reviews error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// GET /api/mess/today
router.get('/today', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const isDemo = (0, demo_1.isDemoUser)(req.user);
        const { data: todayReviews, error } = await supabase_1.supabase
            .from('mess_reviews')
            .select('meal_type, rating, student_id')
            .eq('review_date', today);
        if (error)
            return res.status(500).json({ error: 'Failed to fetch today\'s data.' });
        let validReviews = todayReviews || [];
        if (!isDemo) {
            validReviews = validReviews.filter((r) => !(0, demo_1.isDummyMessReview)(r));
        }
        const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];
        const summary = meals.map(meal => {
            const mealReviews = validReviews.filter(r => r.meal_type === meal);
            const avg = mealReviews.length > 0
                ? mealReviews.reduce((sum, r) => sum + r.rating, 0) / mealReviews.length
                : null;
            const myReview = mealReviews.find(r => r.student_id === req.user.id);
            return {
                meal,
                count: mealReviews.length,
                avg_rating: avg ? Math.round(avg * 10) / 10 : null,
                my_review: myReview || null,
            };
        });
        return res.json({ date: today, meals: summary });
    }
    catch (err) {
        return res.status(500).json({ error: 'Server error.' });
    }
});
// POST /api/mess/reviews — submit or update review
router.post('/reviews', async (req, res) => {
    try {
        const { meal_type, date, rating, review, anonymous } = req.body;
        if (!meal_type || !date || !rating) {
            return res.status(400).json({ error: 'meal_type, date and rating are required.' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
        }
        if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(meal_type)) {
            return res.status(400).json({ error: 'Invalid meal_type.' });
        }
        // Validate date format
        const reviewDate = new Date(date);
        if (isNaN(reviewDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date.' });
        }
        // Upsert: insert or update if same student+meal+date
        const { error } = await supabase_1.supabase
            .from('mess_reviews')
            .upsert({
            student_id: req.user.id,
            meal_type,
            review_date: date,
            rating: Math.round(rating),
            review_text: review?.trim() || null,
            anonymous: !!anonymous,
        }, { onConflict: 'student_id,meal_type,review_date' });
        if (error) {
            console.error('Submit review error:', error);
            if (error.code === '23514') {
                return res.status(400).json({
                    error: 'Snacks review requires database update: please run ALTER TABLE mess_reviews DROP CONSTRAINT IF EXISTS mess_reviews_meal_type_check; in Supabase SQL editor.'
                });
            }
            return res.status(500).json({ error: 'Failed to submit review.' });
        }
        // Notify admins about the new mess feedback in real time
        const stars = '⭐'.repeat(Math.min(5, Math.max(1, Math.round(rating))));
        notification_service_1.NotificationService.notifyAdmins({
            title: '🍛 New Mess Feedback',
            message: `Student submitted feedback for ${meal_type.toUpperCase()} (${stars} - ${rating}/5).\n${review?.trim() ? `"${review.trim()}"` : 'No written comment'}`,
            type: 'mess',
            related_type: 'mess',
            priority: 'normal',
        }).catch(err => console.error('Failed to notify admins of mess review:', err));
        return res.status(201).json({ success: true });
    }
    catch (err) {
        console.error('Submit review error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
// GET /api/mess/analytics
router.get('/analytics', async (req, res) => {
    try {
        const isDemo = (0, demo_1.isDemoUser)(req.user);
        const { data: reviews, error } = await supabase_1.supabase
            .from('mess_reviews')
            .select(`*, profiles:student_id ( name, email )`);
        if (error)
            return res.status(500).json({ error: 'Failed to fetch analytics.' });
        let all = reviews || [];
        if (!isDemo) {
            all = all.filter((r) => !(0, demo_1.isDummyMessReview)(r));
        }
        const overallAvg = all.length > 0
            ? all.reduce((sum, r) => sum + r.rating, 0) / all.length
            : 0;
        const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];
        const mealStats = meals.map(meal => {
            const mealReviews = all.filter((r) => r.meal_type === meal);
            const avg = mealReviews.length > 0
                ? mealReviews.reduce((sum, r) => sum + r.rating, 0) / mealReviews.length
                : 0;
            return { meal, count: mealReviews.length, avg_rating: Math.round(avg * 10) / 10 };
        });
        // Daily data for last 7 days
        const dailyData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayReviews = all.filter((r) => r.review_date === dateStr);
            const avg = dayReviews.length > 0
                ? dayReviews.reduce((sum, r) => sum + r.rating, 0) / dayReviews.length
                : 0;
            dailyData.push({ date: dateStr, avg: Math.round(avg * 10) / 10, count: dayReviews.length });
        }
        // Recent reviews (last 15)
        const recent = [...all]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 15)
            .map((r) => ({
            ...r,
            review: r.review_text,
            date: r.review_date,
            student_name: r.anonymous ? 'Anonymous' : (r.profiles?.name || 'Student'),
            profiles: undefined,
        }));
        return res.json({
            overall_avg: Math.round(overallAvg * 10) / 10,
            total_reviews: all.length,
            meal_stats: mealStats,
            daily_data: dailyData,
            recent_reviews: recent,
        });
    }
    catch (err) {
        console.error('Analytics error:', err);
        return res.status(500).json({ error: 'Server error.' });
    }
});
exports.default = router;
