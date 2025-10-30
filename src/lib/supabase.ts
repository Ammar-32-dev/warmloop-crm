import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company: string | null;
  score: number;
  status: string;
  // Additional fields for scoring
  source?: string;
  estimated_value?: number;
  activities_last_30d?: number;
  last_activity?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  user_id: string;
  full_name: string | null;
  created_at: string;
}
