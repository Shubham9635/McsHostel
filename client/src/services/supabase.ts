import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bdhddvnmecfwkkhtpzhi.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkaGRkdm5tZWNmd2traHRwemhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4ODYyNjYsImV4cCI6MjEwNDQ2MjI2Nn0.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

export default supabase;
