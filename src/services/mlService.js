
import { supabase } from '@/integrations/supabase/client';

export const suggestCategories = async (description) => {
  try {
    const { data, error } = await supabase.functions.invoke('suggest-category', {
      body: { description },
    });

    if (error) {
      console.error('Error suggesting categories:', error);
      return [];
    }

    return data.categories || [];
  } catch (error) {
    console.error('Error in category suggestion service:', error);
    return [];
  }
};
