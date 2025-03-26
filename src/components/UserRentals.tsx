
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserRentals } from '@/services/itemService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const UserRentals = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadUserRentals = async () => {
      try {
        const data = await fetchUserRentals(user.id);
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-rentmate-orange border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading your rentals...</p>
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
          <Link to="/browse" className="button-primary bg-rentmate-orange text-white">
            Browse Items
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.map(rental => (
            <div key={rental.id} className="glass rounded-xl overflow-hidden">
              <div className="h-40 overflow-hidden">
                {rental.item.images && rental.item.images.length > 0 ? (
                  <img 
                    src={rental.item.images[0].image_url} 
                    alt={rental.item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium">{rental.item.name}</h3>
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
                  <p className="font-semibold">${rental.total_price}</p>
                </div>
                <div className="mt-3 flex justify-end">
                  <Link 
                    to={`/item/${rental.item.id}`}
                    className="text-sm text-rentmate-orange hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserRentals;
