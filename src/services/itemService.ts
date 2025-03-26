
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export type Item = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  daily_rate: boolean;
  category: string | null;
  condition: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type ItemWithImages = Item & {
  images: {
    id: string;
    image_url: string;
    is_primary: boolean;
  }[];
  owner?: {
    full_name: string;
    avatar_url: string;
  };
};

export type NewItem = {
  name: string;
  description: string;
  price: number;
  daily_rate: boolean;
  category: string;
  condition: string;
};

// Fetch all items
export const fetchItems = async (): Promise<ItemWithImages[]> => {
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
  return data.map((item: any) => ({
    ...item,
    images: item.item_images || [],
    owner: item.profiles
  }));
};

// Fetch user's items
export const fetchUserItems = async (userId: string): Promise<ItemWithImages[]> => {
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

  return data.map((item: any) => ({
    ...item,
    images: item.item_images || [],
    owner: item.profiles
  }));
};

// Fetch user's rentals
export const fetchUserRentals = async (userId: string): Promise<any[]> => {
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

  return data.map((rental: any) => ({
    ...rental,
    item: {
      ...rental.items,
      images: rental.items.item_images || [],
      owner: rental.items.profiles
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
      renter:renter_id (full_name, avatar_url)
    `)
    .eq('items.owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching owner rentals:', error);
    throw error;
  }

  return data.map((rental: any) => ({
    ...rental,
    item: {
      ...rental.items,
      images: rental.items.item_images || []
    }
  }));
};

// Create new item
export const createItem = async (
  item: NewItem,
  userId: string,
  images: File[]
): Promise<ItemWithImages | null> => {
  // Insert the item first
  const { data: itemData, error: itemError } = await supabase
    .from('items')
    .insert({
      name: item.name,
      description: item.description,
      price: item.price,
      daily_rate: item.daily_rate,
      category: item.category,
      condition: item.condition,
      owner_id: userId
    })
    .select()
    .single();

  if (itemError) {
    console.error('Error creating item:', itemError);
    throw itemError;
  }

  const itemId = itemData.id;
  const imageUrls = [];

  // Upload images
  if (images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${itemId}/${uuidv4()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('item_images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('item_images')
        .getPublicUrl(fileName);

      const imageUrl = data.publicUrl;
      imageUrls.push(imageUrl);

      // Insert image record
      const { error: imageInsertError } = await supabase
        .from('item_images')
        .insert({
          item_id: itemId,
          image_url: imageUrl,
          is_primary: i === 0 // First image is primary
        });

      if (imageInsertError) {
        console.error('Error inserting image record:', imageInsertError);
      }
    }
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
    owner: completeItem.profiles
  };
};

// Create rental
export const createRental = async (
  itemId: string,
  startDate: Date,
  endDate: Date,
  totalPrice: number
): Promise<any> => {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
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
};

// Update rental status
export const updateRentalStatus = async (
  rentalId: string,
  status: 'pending' | 'active' | 'completed' | 'cancelled'
): Promise<void> => {
  const { error } = await supabase
    .from('rentals')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', rentalId);

  if (error) {
    console.error('Error updating rental status:', error);
    throw error;
  }
};
