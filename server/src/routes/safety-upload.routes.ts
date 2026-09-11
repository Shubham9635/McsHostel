import { Router, Response } from 'express';
import multer from 'multer';
import { supabase } from '../db/supabase';
import { authenticate, AuthRequest, requireStudent } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// 50MB max limit to allow video uploads up to 50MB and photos up to 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mime = file.mimetype.toLowerCase();
    const isImage = mime.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.originalname);
    const isVideo = mime.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.originalname);

    if (isImage || isVideo) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WEBP) or video files (MP4, WEBM, MOV) are allowed.'));
    }
  },
});

// Middleware to accept either 'evidence' or 'file' field name
const uploadAnyEvidence = upload.single('evidence');

// POST /api/safety/upload/:reportId — upload single evidence file
router.post('/upload/:reportId', requireStudent, (req: AuthRequest, res: Response, next) => {
  uploadAnyEvidence(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File exceeds the maximum size limit (50MB for video, 10MB for photos).' });
      }
      return res.status(400).json({ error: err.message || 'File upload error.' });
    }
    next();
  });
}, async (req: AuthRequest, res: Response) => {
  try {
    const { reportId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No evidence file received.' });
    }

    // Check specific file type limits:
    const isVideo = file.mimetype.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.originalname);
    if (!isVideo && file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Photo evidence must be 10MB or smaller.' });
    }
    if (isVideo && file.size > 50 * 1024 * 1024) {
      return res.status(400).json({ error: 'Video evidence must be 50MB or smaller.' });
    }

    // Verify report exists and belongs to the authenticated student
    const { data: report, error: reportErr } = await supabase
      .from('safety_reports')
      .select('id, reporter_user_id')
      .eq('id', reportId)
      .single();

    if (reportErr || !report) {
      return res.status(404).json({ error: 'Safety report not found.' });
    }

    if (report.reporter_user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied. You can only attach evidence to your own reports.' });
    }

    const ext = file.originalname.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
    const safeExt = ext.replace(/[^a-zA-Z0-9]/g, '');
    const filename = `evidence_${reportId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

    // Upload to private 'safety-evidence' bucket
    const { error: uploadErr } = await supabase.storage
      .from('safety-evidence')
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadErr) {
      console.error('Supabase storage upload error:', uploadErr);
      // If bucket does not exist, log guidance
      return res.status(500).json({
        error: 'Storage error. Please ensure the private "safety-evidence" bucket is configured in Supabase Storage.',
      });
    }

    // Insert metadata record in safety_report_evidence table
    const { data: evRecord, error: evErr } = await supabase
      .from('safety_report_evidence')
      .insert({
        report_id: reportId,
        storage_path: filename,
        file_name: file.originalname,
        file_type: file.mimetype,
        file_size: file.size,
      })
      .select()
      .single();

    if (evErr) {
      console.error('Insert evidence metadata error:', evErr);
      return res.status(500).json({ error: 'Failed to record evidence file metadata.' });
    }

    return res.status(201).json({
      success: true,
      evidence: evRecord,
      message: 'Evidence securely uploaded.',
    });
  } catch (err: any) {
    console.error('Evidence upload handler error:', err);
    return res.status(500).json({ error: 'Internal server error during evidence upload.' });
  }
});

export default router;
