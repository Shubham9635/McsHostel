"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const supabase_1 = require("../db/supabase");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Use memory storage — we stream directly to Supabase Storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed.'));
        }
    },
});
// POST /api/upload/complaint-photo
router.post('/complaint-photo', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }
        const ext = req.file.originalname.split('.').pop() || 'jpg';
        const filename = `complaints/${req.user.id}/${Date.now()}.${ext}`;
        const { error } = await supabase_1.supabase.storage
            .from('complaint-photos')
            .upload(filename, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
        });
        if (error) {
            console.error('Storage upload error:', error);
            // Fallback: if bucket doesn't exist yet, continue without photo
            return res.status(500).json({
                error: 'Failed to upload image. Please ensure the "complaint-photos" storage bucket exists in Supabase.',
                details: error.message,
            });
        }
        const { data: urlData } = supabase_1.supabase.storage
            .from('complaint-photos')
            .getPublicUrl(filename);
        return res.json({ url: urlData.publicUrl });
    }
    catch (err) {
        console.error('Upload error:', err);
        if (err.message === 'Only image files are allowed.') {
            return res.status(400).json({ error: err.message });
        }
        return res.status(500).json({ error: 'Upload failed.' });
    }
});
exports.default = router;
