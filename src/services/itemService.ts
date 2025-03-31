
import { supabase, ensureUserProfile, refreshSchemaCache } from '@/integrations/supabase/client';
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
  images: ItemImage[];
  owner: ItemOwner;
}

// Fetch all items with improved performance
export const fetchItems = async (): Promise<ItemWithImages[]> => {
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

  // Transform the data to match our ItemWithImages type
  return (data || []).map((item: any) => ({
    ...item,
    images: item.item_images?.map((img: any) => img.image_url) || [],
    owner: {
      id: item.profiles?.id || '',
      name: item.profiles?.full_name || 'Unknown User',
      avatar: item.profiles?.avatar_url || 'https://via.placeholder.com/150',
      rating: 4.8 // Default rating
    },
    price: parseInt(item.price), // Ensure price is a number
    priceUnit: item.daily_rate ? "day" : "rental",
    location: item.location || 'Not specified'
  }));
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

  return (data || []).map((item: any) => ({
    ...item,
    images: item.item_images?.map((img: any) => img.image_url) || [],
    owner: {
      id: item.profiles?.id || '',
      name: item.profiles?.full_name || 'Unknown User',
      avatar: item.profiles?.avatar_url || 'https://via.placeholder.com/150',
      rating: 4.8 // Default rating
    },
    price: parseInt(item.price), // Ensure price is a number
    priceUnit: item.daily_rate ? "day" : "rental",
    location: item.location || 'Not specified'
  }));
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

  return (data || []).map((rental: any) => ({
    ...rental,
    item: {
      ...rental.items,
      images: rental.items?.item_images?.map((img: any) => img.image_url) || [],
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
  }));
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
    const fileExt = file.name.split('.').pop();
    const fileName = `${itemId}/${uuidv4()}.${fileExt}`;
    
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
        price: parseInt(completeItem.price),
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
  itemId: string,  // Changed type to string to match function usage
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
  status: string
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
