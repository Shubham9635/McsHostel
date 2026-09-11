import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDB } from './db/init';
import authRoutes from './routes/auth.routes';
import safetyRoutes from './routes/safety.routes';
import complaintsRoutes from './routes/complaints.routes';
import messRoutes from './routes/mess.routes';
import notificationsRoutes from './routes/notifications.routes';
import adminRoutes from './routes/admin.routes';
import uploadRoutes from './routes/upload.routes';
import safetyUploadRoutes from './routes/safety-upload.routes';
import announcementsRoutes from './routes/announcements.routes';

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = CLIENT_URL.split(',').map(u => u.trim());

// Initialize DB connection
initDB().then(() => {
  // Middleware
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.netlify.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/complaints', complaintsRoutes);
  app.use('/api/mess', messRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/announcements', announcementsRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/safety', safetyRoutes);
  app.use('/api/safety', safetyUploadRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'HostelHub API is running 🚀', version: '2.0.0' });
  });

  app.listen(PORT, () => {
    console.log(`\n🏨 HostelHub Server running on http://localhost:${PORT}`);
    console.log(`📋 Health: http://localhost:${PORT}/api/health\n`);
  });
});

export default app;
