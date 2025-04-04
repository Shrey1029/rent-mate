import { supabase, ensureUserProfile, refreshSchemaCache } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Fetch all items with improved performance
export const fetchItems = async () => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      item_images (id, image_url, is_primary),
      profiles:owner_id (full_name, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching items:', error);
    throw error;
  }

  // Transform the data to match our ItemWithImages type
  return data.map((item) => ({
    ...item,
    images: item.item_images?.map(img => img.image_url) || [],
    owner: {
      id: item.owner_id,
      name: item.profiles?.full_name || "Unknown",
      avatar: item.profiles?.avatar_url || "https://via.placeholder.com/150",
      rating: 4.8 // Default rating
    },
    location: item.location || 'Not specified'
  }));
};

// Fetch user's items
export const fetchUserItems = async (userId) => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      item_images (id, image_url, is_primary),
      profiles:owner_id (full_name, avatar_url)
    `)
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user items:', error);
    throw error;
  }

  return data.map((item) => ({
    ...item,
    images: item.item_images?.map(img => img.image_url) || [],
    owner: {
      id: item.owner_id,
      name: item.profiles?.full_name || "Unknown",
      avatar: item.profiles?.avatar_url || "https://via.placeholder.com/150",
      rating: 4.8 // Default rating
    },
    location: item.location || 'Not specified'
  }));
};

// Fetch user's rentals with better performance
export const fetchUserRentals = async (userId) => {
  const { data, error } = await supabase
    .from('rentals')
    .select(`
      *,
      items (
        *,
        item_images (id, image_url, is_primary),
        profiles:owner_id (full_name, avatar_url)
      )
    `)
    .eq('renter_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user rentals:', error);
    throw error;
  }

  return data.map((rental) => ({
    ...rental,
    item: {
      ...rental.items,
      images: rental.items.item_images?.map(img => img.image_url) || [],
      owner: {
        id: rental.items.owner_id,
        name: rental.items.profiles?.full_name || "Unknown",
        avatar: rental.items.profiles?.avatar_url || "https://via.placeholder.com/150",
        rating: 4.8 // Default rating
      },
      location: rental.items.location || 'Not specified'
    }
  }));
};

// Fetch items rented from the user
export const fetchOwnerRentals = async (userId) => {
  const { data, error } = await supabase
    .from('rentals')
    .select(`
      *,
      items!inner (
        *,
        item_images (id, image_url, is_primary)
      ),
      renter:renter_id (full_name, avatar_url)
    `)
    .eq('items.owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching owner rentals:', error);
    throw error;
  }

  return data.map((rental) => ({
    ...rental,
    item: {
      ...rental.items,
      images: rental.items.item_images?.map(img => img.image_url) || [],
      location: rental.items.location || 'Not specified'
    }
  }));
};

// Optimize image upload process
const uploadImage = async (file, itemId) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${itemId}/${uuidv4()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('item_images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('item_images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
};

// Create new item with performance optimizations
export const createItem = async (
  item,
  userId,
  images
) => {
  try {
    // Ensure user profile exists before creating item
    const profileExists = await ensureUserProfile(userId);
    if (!profileExists) {
      throw new Error('Failed to validate user profile. Please try again or log out and back in.');
    }
    
    // If schema cache issue occurs, try to refresh it first
    let itemData;
    
    try {
      // Insert the item first
      const { data, error: itemError } = await supabase
        .from('items')
        .insert({
          name: item.name,
          description: item.description,
          price: item.price,
          daily_rate: item.daily_rate,
          category: item.category,
          condition: item.condition,
          location: item.location || null, // Handle the location field
          owner_id: userId
        })
        .select()
        .single();

      if (itemError) {
        // If we get a schema cache error, try refreshing the cache and retry
        if (itemError.message && itemError.message.includes('schema cache')) {
          await refreshSchemaCache();
          // Retry the insert after refreshing cache
          const { data: retryData, error: retryError } = await supabase
            .from('items')
            .insert({
              name: item.name,
              description: item.description,
              price: item.price,
              daily_rate: item.daily_rate,
              category: item.category,
              condition: item.condition,
              location: item.location || null,
              owner_id: userId
            })
            .select()
            .single();
            
          if (retryError) {
            console.error('Error creating item after cache refresh:', retryError);
            throw retryError;
          }
          
          itemData = retryData;
        } else {
          console.error('Error creating item:', itemError);
          throw itemError;
        }
      } else {
        itemData = data;
      }

      const itemId = itemData.id;
      
      // Process images in parallel for better performance
      if (images.length > 0) {
        const imagePromises = [];
        
        // Upload all images in parallel
        const uploadPromises = images.map(file => uploadImage(file, itemId));
        const imageUrls = await Promise.all(uploadPromises);
        
        // Create image records
        for (let i = 0; i < imageUrls.length; i++) {
          const imageUrl = imageUrls[i];
          imagePromises.push(
            supabase
              .from('item_images')
              .insert({
                item_id: itemId,
                image_url: imageUrl,
                is_primary: i === 0 // First image is primary
              })
          );
        }
        
        // Wait for all image insertions
        await Promise.all(imagePromises);
      }

      // Fetch the complete item with images
      const { data: completeItem, error: fetchError } = await supabase
        .from('items')
        .select(`
          *,
          item_images (id, image_url, is_primary),
          profiles:owner_id (full_name, avatar_url)
        `)
        .eq('id', itemId)
        .single();

      if (fetchError) {
        console.error('Error fetching complete item:', fetchError);
        return null;
      }

      return {
        ...completeItem,
        images: completeItem.item_images || [],
        owner: completeItem.profiles || {}
      };
    } catch (error) {
      // Check if it's a foreign key violation error
      if (error.code === '23503' && error.message.includes('owner_id_fkey')) {
        throw new Error('User profile not found. Please log out and log in again.');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in createItem:', error);
    throw error;
  }
};

// Create rental with better error handling
export const createRental = async (
  itemId,
  startDate,
  endDate,
  totalPrice
) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('rentals')
      .insert({
        item_id: itemId,
        renter_id: userData.user.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_price: totalPrice,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating rental:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createRental:', error);
    throw error;
  }
};

// Update rental status with better error handling
export const updateRentalStatus = async (
  rentalId,
  status
) => {
  try {
    const { error } = await supabase
      .from('rentals')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', rentalId);

    if (error) {
      console.error('Error updating rental status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateRentalStatus:', error);
    throw error;
  }
};

// Add delete item functionality
export const deleteItem = async (itemId) => {
  try {
    // Get user authentication
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }
    
    // First, delete all images associated with the item from storage
    // Get the item images
    const { data: imageData, error: imageError } = await supabase
      .from('item_images')
      .select('image_url')
      .eq('item_id', itemId);
      
    if (imageError) {
      console.error('Error fetching item images:', imageError);
    } else if (imageData && imageData.length > 0) {
      // Extract paths from image URLs and delete them
      const imagePaths = imageData.map(img => {
        // Extract the path after the last '/storage/v1/object/public/item_images/'
        const fullPath = img.image_url;
        const pathParts = fullPath.split('item_images/');
        if (pathParts.length > 1) {
          return pathParts[1];
        }
        return null;
      }).filter(Boolean);
      
      // Delete images from storage if paths were extracted
      if (imagePaths.length > 0) {
        const { error: deleteStorageError } = await supabase.storage
          .from('item_images')
          .remove(imagePaths);
          
        if (deleteStorageError) {
          console.error('Error deleting images from storage:', deleteStorageError);
        }
      }
    }
    
    // Delete the item from the database
    // This will cascade delete the item_images records due to foreign key constraints
    const { error: deleteError } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);
      
    if (deleteError) {
      console.error('Error deleting item:', deleteError);
      throw deleteError;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteItem:', error);
    throw error;
  }
};
