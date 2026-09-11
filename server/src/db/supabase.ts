import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.SUPABASE_URL || '';
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Clean any surrounding quotes, whitespace, or newlines copied from .env or dashboards
const supabaseUrl = rawUrl.trim().replace(/^["']|["']$/g, '');
const supabaseServiceKey = rawKey.trim().replace(/^["']|["']$/g, '');

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
  console.warn('   Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your deployment environment settings.');
}

// Service-role client bypasses RLS — only used server-side
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseServiceKey || 'placeholder', {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default supabase;
