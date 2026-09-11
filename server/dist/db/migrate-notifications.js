"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const supabase_1 = require("./supabase");
async function run() {
    console.log('🔄 Checking notifications table columns...');
    // Try querying with new columns to check if they already exist
    const { data, error } = await supabase_1.supabase
        .from('notifications')
        .select('id, user_id, recipient_user_id, related_type, related_id, priority, actor_user_id, metadata')
        .limit(1);
    if (error) {
        console.log('⚠️ Some columns might be missing:', error.message);
        console.log('ℹ️ Attempting to add columns via RPC or direct query if available...');
        // We can execute SQL via rpc if configured, or inform developer
        const { error: rpcErr } = await supabase_1.supabase.rpc('execute_sql', {
            sql: `
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_type TEXT;
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_id TEXT;
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"complaints":true,"safety":true,"mess":true,"system":true,"sound":false}'::jsonb;
      `
        });
        if (rpcErr) {
            console.log('ℹ️ Note on direct RPC: ' + rpcErr.message);
        }
    }
    else {
        console.log('✅ Columns already present on notifications table:', Object.keys(data[0] || {}));
    }
    // Check profiles notification_preferences
    const { data: profData, error: profErr } = await supabase_1.supabase
        .from('profiles')
        .select('id, notification_preferences')
        .limit(1);
    if (!profErr) {
        console.log('✅ Profiles table has notification_preferences!');
    }
    else {
        console.log('⚠️ Profiles check:', profErr.message);
    }
}
run().catch(console.error);
