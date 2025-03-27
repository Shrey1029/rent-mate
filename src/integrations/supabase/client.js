
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
  // Add queryCache to improve performance
  cache: {
    maxAge: 30, // Cache results for 30 seconds
  },
});

// Helper function to refresh schema cache - call when getting schema errors
export const refreshSchemaCache = async () => {
  try {
    await supabase.rpc('reload_types');
    console.log('Schema cache refreshed');
  } catch (error) {
    console.error('Error refreshing schema cache:', error);
  }
};
