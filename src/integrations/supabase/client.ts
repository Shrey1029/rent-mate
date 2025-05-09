
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Utility to ensure user profile exists
export const ensureUserProfile = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking profile:', error);
      return false;
    }
    
    // If profile doesn't exist, create it
    if (!data) {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return false;
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: authData.user.email?.split('@')[0] || 'User',
          avatar_url: null
        });
        
      if (insertError) {
        console.error('Error creating profile:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Exception in ensureUserProfile:', error);
    return false;
  }
};

// Utility to ensure storage bucket exists
export const ensureStorageBucket = async (bucketName: string, publicBucket: boolean = false): Promise<boolean> => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    
    // Check if bucket exists
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: publicBucket,
        fileSizeLimit: 1024 * 1024 * 10, // 10MB limit
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in ensureStorageBucket:', error);
    return false;
  }
};

// Utility to refresh schema cache (used when schema cache errors occur)
export const refreshSchemaCache = async (): Promise<boolean> => {
  try {
    // Make a simple query to force a schema cache refresh
    await supabase.from('items').select('id').limit(1);
    return true;
  } catch (error) {
    console.error('Error refreshing schema cache:', error);
    return false;
  }
};
