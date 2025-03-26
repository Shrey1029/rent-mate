
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { fetchUserItems, ItemWithImages } from '@/services/itemService';
import ItemCard from '@/components/ItemCard';
import CreateItemForm from '@/components/CreateItemForm';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const UserItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ItemWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadUserItems = async () => {
      try {
        const data = await fetchUserItems(user.id);
        setItems(data);
      } catch (error) {
        console.error('Error loading user items:', error);
        toast.error('Failed to load your items');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserItems();
  }, [user]);

  const handleItemCreated = async () => {
    setShowCreateForm(false);
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await fetchUserItems(user.id);
      setItems(data);
    } catch (error) {
      console.error('Error refreshing items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-rentmate-orange border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading your items...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Listings</h2>
        <button 
          className="button-primary bg-rentmate-orange text-white py-2 px-4 flex items-center"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Listing
        </button>
      </div>
      
      {showCreateForm && (
        <div className="mb-8">
          <CreateItemForm 
            onSuccess={handleItemCreated} 
            onCancel={() => setShowCreateForm(false)} 
          />
        </div>
      )}
      
      {!showCreateForm && items.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center">
          <h3 className="text-lg font-medium mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven't added any items for rent. Start earning by listing your items!
          </p>
          <button 
            className="button-primary bg-rentmate-orange text-white"
            onClick={() => setShowCreateForm(true)}
          >
            Add Your First Listing
          </button>
        </div>
      ) : (
        !showCreateForm && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <ItemCard 
                key={item.id} 
                item={{
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  category: item.category || 'Uncategorized',
                  location: 'Your listing',
                  rating: 5,
                  priceUnit: item.daily_rate ? 'day' : 'week',
                  description: item.description || '',
                  images: item.images.map(img => img.image_url),
                  owner: {
                    id: user?.id || '',
                    name: 'You',
                    avatar: item.owner?.avatar_url || '/placeholder.svg',
                    rating: 5
                  }
                }} 
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default UserItems;
