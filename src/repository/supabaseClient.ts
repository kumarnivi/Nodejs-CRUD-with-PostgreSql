// src/repository/supabaseClient.ts
import 'dotenv/config'; // Load .env automatically
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('❌ Missing Supabase credentials in .env');
}

// Log for debugging
console.log('🧩 SUPABASE_URL:', SUPABASE_URL);
console.log('🧩 SUPABASE_KEY loaded:', !!SUPABASE_KEY);

// Create Supabase client
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
