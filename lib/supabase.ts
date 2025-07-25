import { createClient } from '@supabase/supabase-js';

// Fallback values for development
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xgdtjgrqmqojwfsexqfr.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZHRqZ3JxbXFvandmc2V4cWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MDU3MDYsImV4cCI6MjA2ODk4MTcwNn0.V4FulZc8wj7-YhcCn7Oh9lhQUwNZJJYk6bkOJuvK-hU';

console.log('Supabase configuration loaded successfully');
console.log('URL:', supabaseUrl.substring(0, 30) + '...');
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');

if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url_here') {
  console.error('Please configure EXPO_PUBLIC_SUPABASE_URL in your .env file');
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') {
  console.error('Please configure EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file');
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
