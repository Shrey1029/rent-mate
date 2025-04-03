
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://iktguzgjzcadylzscrwi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrdGd1emdqemNhZHlsenNjcndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4ODg5NjQsImV4cCI6MjA1ODQ2NDk2NH0.W3A4sPOjinwVvG2vydcD3In0VQjjuAqzrOGo_XzuBHk";

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      timeout: 30000, // Increase timeout to avoid reconnections
    },
  }
);

// Helper function to refresh schema cache - call when getting schema errors
export const refreshSchemaCache = async () => {
  try {
    await supabase.rpc('reload_types');
    console.log('Schema cache refreshed');
  } catch (error) {
    console.error('Error refreshing schema cache:', error);
  }
};

// Helper function to ensure user profile exists
export const ensureUserProfile = async (userId: string) => {
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking profile:', fetchError);
      return false;
    }
    
    // If profile already exists, we're good
    if (existingProfile) return true;
    
    // Get user data
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return false;
    
    // Create profile if it doesn't exist
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: userData.user.user_metadata?.full_name || userData.user.email?.split('@')[0] || 'User',
        avatar_url: userData.user.user_metadata?.avatar_url || null
      });
    
    if (insertError) {
      console.error('Error creating profile:', insertError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return false;
  }
};

// Helper function to ensure a storage bucket exists
export const ensureStorageBucket = async (bucketName: string, isPublic: boolean = false) => {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating storage bucket: ${bucketName}`);
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) {
        console.error(`Error creating bucket ${bucketName}:`, error);
        return false;
      }
      
      console.log(`Successfully created bucket: ${bucketName}`);
    } else {
      console.log(`Bucket ${bucketName} already exists`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error in ensureStorageBucket for ${bucketName}:`, error);
    return false;
  }
};
