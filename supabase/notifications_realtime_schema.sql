-- ================================================================
-- HOSTELHUB: REAL-TIME NOTIFICATION SCHEMA ENHANCEMENT
-- ================================================================

-- 1. Extend notifications table with production fields
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_id TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Synchronize user_id and recipient_user_id for backwards compatibility
UPDATE notifications SET recipient_user_id = user_id WHERE recipient_user_id IS NULL;

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON notifications(recipient_user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_related ON notifications(related_type, related_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- 3. Add notification preferences to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "complaints": true,
  "safety": true,
  "mess": true,
  "system": true,
  "sound": false
}'::jsonb;

-- 4. Enable Supabase Realtime for notifications table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    NULL; -- Publication might not exist in standalone postgres
END $$;
