
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://iktguzgjzcadylzscrwi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrdGd1emdqemNhZHlsenNjcndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4ODg5NjQsImV4cCI6MjA1ODQ2NDk2NH0.W3A4sPOjinwVvG2vydcD3In0VQjjuAqzrOGo_XzuBHk";

// Create a single supabase client for interacting with your database
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    timeout: 30000, // Increase timeout to avoid reconnections
  },
  db: {
    schema: 'public',
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
});
