
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserRentals } from '@/services/itemService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Package, ImageOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RentalItem {
  id: string;
  name: string;
  description: string;
  images: string[];
  [key: string]: any;
}

interface Rental {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  item: RentalItem;
  [key: string]: any;
}

const UserRentals: React.FC = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;

    const loadUserRentals = async () => {
      try {
        const data = await fetchUserRentals(user.id);
        console.log('Rental data:', data); // Debugging log
        setRentals(data);
      } catch (error) {
        console.error('Error loading user rentals:', error);
        toast.error('Failed to load your rentals');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserRentals();
  }, [user]);

  const handleImageError = (rentalId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [rentalId]: true
    }));
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">My Rentals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass rounded-xl overflow-hidden shadow-sm">
              <Skeleton className="h-40 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">My Rentals</h2>
      
      {rentals.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center">
          <h3 className="text-lg font-medium mb-2">No rental items</h3>
          <p className="text-muted-foreground mb-4">
            You haven't rented any items yet.
          </p>
          <Link to="/browse" className="button-primary bg-rentmate-orange text-white py-2 px-4 rounded-lg inline-block">
            Browse Items
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.map(rental => {
            // Get first valid image URL or null
            const imageUrl = rental.item && 
                            Array.isArray(rental.item.images) && 
                            rental.item.images.length > 0 ? 
                            rental.item.images[0] : null;
            
            return (
              <div key={rental.id} className="glass rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-40 overflow-hidden">
                  {imageErrors[rental.id] || !imageUrl ? (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ImageOff className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <img 
                      src={imageUrl} 
                      alt={rental.item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={() => handleImageError(rental.id)}
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg">{rental.item?.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          rental.status === 'active' ? 'bg-green-100 text-green-800' : 
                          rental.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                          rental.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="font-semibold">₹{rental.total_price}</p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Link 
                      to={`/item/${rental.item?.id}`}
                      className="text-sm text-rentmate-orange hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserRentals;
