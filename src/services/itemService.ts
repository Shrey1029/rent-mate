import { supabase, ensureUserProfile, refreshSchemaCache, ensureStorageBucket } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Define types for clarity
interface ItemImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface ItemOwner {
  id?: string;
  full_name?: string;
  avatar_url?: string;
}

interface ItemData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  daily_rate: boolean | null;
  category: string | null;
  condition: string | null;
  location: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  item_images?: ItemImage[];
  profiles?: ItemOwner;
}

interface ItemInsert {
  name: string;
  description: string | null;
  price: number;
  daily_rate: boolean | null;
  category: string | null;
  condition: string | null;
  location: string | null;
}

interface ItemWithImages extends ItemData {
  images: string[];
  owner: ItemOwner;
}

// Fetch all items with improved performance
export const fetchItems = async (): Promise<ItemWithImages[]> => {
  try {
    console.log("Fetching all items from Supabase");
    
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        item_images (id, image_url, is_primary),
        profiles:owner_id (id, full_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching items:', error);
      throw error;
    }

    console.log(`Retrieved ${data?.length || 0} items from database`);

    // Transform the data to match our ItemWithImages type
    return (data || []).map((item: any) => {
      // Properly extract image URLs from item_images
      const imageUrls = item.item_images?.map((img: ItemImage) => {
        return img.image_url;
      }) || [];
      
      console.log(`Item ${item.id} has ${imageUrls.length} images`);
      
      return {
        ...item,
        // Just extract the image URLs as strings
        images: imageUrls,
        owner: {
          id: item.profiles?.id || '',
          name: item.profiles?.full_name || 'Unknown User',
          avatar: item.profiles?.avatar_url || 'https://via.placeholder.com/150',
          rating: 4.8 // Default rating
        },
        price: Number(item.price), // Ensure price is a number
        priceUnit: item.daily_rate ? "day" : "rental",
        location: item.location || 'Not specified'
      };
    });
  } catch (error) {
    console.error("Error in fetchItems:", error);
    throw error;
  }
};

// Fetch user's items
export const fetchUserItems = async (userId: string): Promise<ItemWithImages[]> => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      item_images (id, image_url, is_primary),
      profiles:owner_id (id, full_name, avatar_url)
    `)
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user items:', error);
    throw error;
  }

  return (data || []).map((item: any) => {
    // Properly extract image URLs
    const imageUrls = item.item_images?.map((img: ItemImage) => img.image_url) || [];
    
    return {
      ...item,
      images: imageUrls,
      owner: {
        id: item.profiles?.id || '',
        name: item.profiles?.full_name || 'Unknown User',
        avatar: item.profiles?.avatar_url || 'https://via.placeholder.com/150',
        rating: 4.8 // Default rating
      },
      price: Number(item.price), // Ensure price is a number
      priceUnit: item.daily_rate ? "day" : "rental",
      location: item.location || 'Not specified'
    };
  });
};

// Fetch user's rentals with better performance
export const fetchUserRentals = async (userId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('rentals')
    .select(`
      *,
      items (
        *,
        item_images (id, image_url, is_primary),
        profiles:owner_id (id, full_name, avatar_url)
      )
    `)
    .eq('renter_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user rentals:', error);
    throw error;
  }

  return (data || []).map((rental: any) => {
    // Extract image URLs properly
    const imageUrls = rental.items?.item_images?.map((img: ItemImage) => img.image_url) || [];
    
    return {
      ...rental,
      item: {
        ...rental.items,
        images: imageUrls,
        owner: {
          id: rental.items?.profiles?.id || '',
          name: rental.items?.profiles?.full_name || 'Unknown User',
          avatar: rental.items?.profiles?.avatar_url || 'https://via.placeholder.com/150',
          rating: 4.8 // Default rating
        },
        price: parseInt(rental.items?.price), // Ensure price is a number
        priceUnit: rental.items?.daily_rate ? "day" : "rental",
        location: rental.items?.location || 'Not specified'
      }
    };
  });
};

// Fetch items rented from the user
export const fetchOwnerRentals = async (userId: string): Promise<any[]> => {
  const { data, error } = await supabase
    .from('rentals')
    .select(`
      *,
      items!inner (
        *,
        item_images (id, image_url, is_primary)
      ),
      renter:renter_id (id, full_name, avatar_url)
    `)
    .eq('items.owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching owner rentals:', error);
    throw error;
  }

  return (data || []).map((rental: any) => ({
    ...rental,
    item: {
      ...rental.items,
      images: rental.items?.item_images?.map((img: any) => img.image_url) || [],
      price: parseInt(rental.items?.price), // Ensure price is a number
      priceUnit: rental.items?.daily_rate ? "day" : "rental",
      location: rental.items?.location || 'Not specified'
    },
    renter: {
      id: rental.renter?.id || '',
      name: rental.renter?.full_name || 'Unknown User',
      avatar: rental.renter?.avatar_url || 'https://via.placeholder.com/150'
    }
  }));
};

// Optimize image upload process
const uploadImage = async (file: File, itemId: string): Promise<string> => {
  try {
    // Ensure the item_images bucket exists
    await ensureStorageBucket('item_images', true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${itemId}/${uuidv4()}.${fileExt}`;
    
    console.log(`Uploading file: ${fileName}, size: ${file.size} bytes`);
    
    // Upload to the item_images bucket
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

    console.log('Image uploaded successfully:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
};

// Create new item with performance optimizations
export const createItem = async (
  item: ItemInsert,
  userId: string,
  images: File[]
): Promise<ItemWithImages | null> => {
  try {
    console.log('Creating item with images:', images.length);
    
    // Ensure user profile exists before creating item
    const profileExists = await ensureUserProfile(userId);
    if (!profileExists) {
      throw new Error('Failed to validate user profile. Please try again or log out and back in.');
    }
    
    // Ensure item_images bucket exists before uploading
    const bucketExists = await ensureStorageBucket('item_images', true);
    if (!bucketExists) {
      throw new Error('Failed to create storage bucket. Please try again later.');
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
      console.log('Item created with ID:', itemId);
      
      // Process images in parallel for better performance
      if (images.length > 0) {
        console.log('Processing', images.length, 'images');
        
        // Upload all images in parallel
        const uploadPromises = images.map(file => uploadImage(file, itemId));
        const imageUrls = await Promise.all(uploadPromises);
        console.log('Image URLs:', imageUrls);
        
        // Create image records
        for (let i = 0; i < imageUrls.length; i++) {
          const imageUrl = imageUrls[i];
          const { error: imageError } = await supabase
            .from('item_images')
            .insert({
              item_id: itemId,
              image_url: imageUrl,
              is_primary: i === 0 // First image is primary
            });
            
          if (imageError) {
            console.error('Error inserting image record:', imageError);
            // Continue with other images even if one fails
          }
        }
      }

      // Fetch the complete item with images
      const { data: completeItem, error: fetchError } = await supabase
        .from('items')
        .select(`
          *,
          item_images (id, image_url, is_primary),
          profiles:owner_id (id, full_name, avatar_url)
        `)
        .eq('id', itemId)
        .single();

      if (fetchError) {
        console.error('Error fetching complete item:', fetchError);
        return null;
      }

      return {
        ...completeItem,
        images: completeItem.item_images?.map((img: any) => img.image_url) || [],
        owner: {
          id: completeItem.profiles?.id || '',
          name: completeItem.profiles?.full_name || 'Unknown User',
          avatar: completeItem.profiles?.avatar_url || 'https://via.placeholder.com/150',
          rating: 4.8 // Default rating
        },
        price: Number(completeItem.price),
        priceUnit: completeItem.daily_rate ? "day" : "rental",
        location: completeItem.location || 'Not specified'
      } as ItemWithImages;
    } catch (error: any) {
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
  itemId: string,
  startDate: Date,
  endDate: Date,
  totalPrice: number
) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      throw new Error('User not authenticated');
    }

    console.log('Creating rental for item:', itemId, 'by user:', userData.user.id);

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
  rentalId: string,
  status: string,
  denialReason?: string | null
): Promise<boolean> => {
  try {
    console.log(`Updating rental ${rentalId} status to: ${status}`);
    
    // Prepare update data
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };
    
    // If declining and providing a reason, add it
    if (status === 'declined' && denialReason) {
      updateData.denial_reason = denialReason;
    }
    
    const { error } = await supabase
      .from('rentals')
      .update(updateData)
      .eq('id', rentalId);

    if (error) {
      console.error('Error updating rental status:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateRentalStatus:', error);
    return false;
  }
};

// Delete an item and its associated images
export const deleteItem = async (itemId: string): Promise<boolean> => {
  try {
    console.log('Deleting item:', itemId);
    
    // First delete all associated images
    const { data: imageData, error: imageError } = await supabase
      .from('item_images')
      .select('id, image_url')
      .eq('item_id', itemId);
      
    if (imageError) {
      console.error('Error fetching item images to delete:', imageError);
      // Continue with deletion even if fetching images fails
    }
    
    // If there are images, delete them from storage
    if (imageData && imageData.length > 0) {
      console.log(`Found ${imageData.length} images to delete from storage`);
      
      // Extract file paths from image URLs
      const imagePaths = imageData.map(img => {
        // The URL format is https://[domain]/storage/v1/object/public/item_images/[path]
        const urlParts = img.image_url.split('item_images/');
        if (urlParts.length > 1) {
          return urlParts[1];
        }
        return null;
      }).filter(Boolean);
      
      if (imagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('item_images')
          .remove(imagePaths as string[]);
          
        if (storageError) {
          console.error('Error deleting images from storage:', storageError);
          // Continue with deletion even if storage deletion fails
        } else {
          console.log('Successfully deleted images from storage');
        }
      }
      
      // Delete image records from the database
      const { error: deleteImagesError } = await supabase
        .from('item_images')
        .delete()
        .eq('item_id', itemId);
        
      if (deleteImagesError) {
        console.error('Error deleting image records:', deleteImagesError);
        // Continue with item deletion even if image deletion fails
      } else {
        console.log('Successfully deleted image records from database');
      }
    }
    
    // Finally delete the item itself
    const { error: deleteItemError } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);
      
    if (deleteItemError) {
      console.error('Error deleting item:', deleteItemError);
      throw deleteItemError;
    }
    
    console.log('Item successfully deleted');
    return true;
  } catch (error) {
    console.error('Error in deleteItem:', error);
    return false;
  }
};

// New function to automatically reject pending rentals older than 3 hours
export const checkAndAutoRejectPendingRentals = async () => {
  try {
    const threeHoursAgo = new Date();
    threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
    
    // Get all pending rentals created more than 3 hours ago
    const { data, error } = await supabase
      .from('rentals')
      .select('id')
      .eq('status', 'pending')
      .lt('created_at', threeHoursAgo.toISOString());
    
    if (error) {
      console.error('Error checking pending rentals:', error);
      return false;
    }
    
    if (!data || data.length === 0) {
      return true; // No rentals to auto-reject
    }
    
    // Auto-reject the pending rentals
    const updatePromises = data.map(rental => 
      updateRentalStatus(
        rental.id, 
        'declined', 
        'Auto-rejected: Owner did not respond within 3 hours'
      )
    );
    
    await Promise.all(updatePromises);
    console.log(`Auto-rejected ${data.length} pending rentals`);
    
    return true;
  } catch (error) {
    console.error('Error in checkAndAutoRejectPendingRentals:', error);
    return false;
  }
};

// New function to calculate user rating
export const getUserRating = async (userId: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('user_ratings')
      .select('rating')
      .eq('rated_user_id', userId);
    
    if (error) {
      console.error('Error fetching user ratings:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return null; // No ratings yet
    }
    
    // Calculate average rating
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = sum / data.length;
    
    return parseFloat(avgRating.toFixed(1)); // Return with 1 decimal place
  } catch (error) {
    console.error('Error in getUserRating:', error);
    return null;
  }
};

// New function to add a user rating
export const addUserRating = async (
  ratedUserId: string,
  rating: number,
  comment: string | null,
  rentalId: string
): Promise<boolean> => {
  try {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('user_ratings')
      .insert({
        rater_id: userData.user.id,
        rated_user_id: ratedUserId,
        rating,
        comment,
        rental_id: rentalId
      });
    
    if (error) {
      console.error('Error adding user rating:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in addUserRating:', error);
    return false;
  }
};

// Function to generate a rental invoice
export const generateInvoiceData = async (rentalId: string) => {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        items (
          *,
          profiles:owner_id (id, full_name, avatar_url, phone_number, location)
        ),
        renter:profiles!rentals_renter_id_fkey (id, full_name, avatar_url, phone_number, location)
      `)
      .eq('id', rentalId)
      .single();
    
    if (error) {
      console.error('Error fetching rental details for invoice:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Rental not found');
    }
    
    return {
      invoiceNumber: `RNT-${rentalId.substring(0, 8).toUpperCase()}`,
      issueDate: new Date(data.updated_at).toLocaleDateString(),
      rentalPeriod: {
        start: new Date(data.start_date).toLocaleDateString(),
        end: new Date(data.end_date).toLocaleDateString(),
      },
      item: {
        id: data.items.id,
        name: data.items.name,
        price: data.items.price,
        priceUnit: data.items.daily_rate ? 'per day' : 'fixed',
      },
      owner: {
        id: data.items.owner_id,
        name: data.items.profiles?.full_name || 'Unknown',
        contact: data.items.profiles?.phone_number || 'Not provided',
        location: data.items.profiles?.location || 'Not provided',
      },
      renter: {
        id: data.renter_id,
        name: data.renter?.full_name || 'Unknown',
        contact: data.renter?.phone_number || 'Not provided',
        location: data.renter?.location || 'Not provided',
      },
      totalAmount: data.total_price,
      status: data.status,
    };
  } catch (error) {
    console.error('Error in generateInvoiceData:', error);
    throw error;
  }
};
