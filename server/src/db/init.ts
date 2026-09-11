import 'dotenv/config';
import { supabase } from './supabase';

export async function initDB() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️ WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in environment.');
      console.warn('   Please set these under the Environment tab in your hosting dashboard.');
      return;
    }

    // Test Supabase connection by querying profiles
    const { error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection check warning:', error.message);
      console.error('   Please verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your hosting Environment settings.');
      console.error('   Note: Use the "service_role" secret key from Supabase Project Settings -> API, not the anon key.');
      return;
    }
    console.log('✅ Supabase database connected successfully');
  } catch (err: any) {
    console.error('❌ Failed to connect to Supabase:', err.message);
  }
}
