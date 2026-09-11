import { Router, Response } from 'express';
import multer from 'multer';
import { supabase } from '../db/supabase';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// Use memory storage — we stream directly to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

// POST /api/upload/complaint-photo
router.post('/complaint-photo', upload.single('photo'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const ext = req.file.originalname.split('.').pop() || 'jpg';
    const filename = `complaints/${req.user!.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
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

    const { data: urlData } = supabase.storage
      .from('complaint-photos')
      .getPublicUrl(filename);

    return res.json({ url: urlData.publicUrl });
  } catch (err: any) {
    console.error('Upload error:', err);
    if (err.message === 'Only image files are allowed.') {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Upload failed.' });
  }
});

export default router;
