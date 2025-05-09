
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserRentals } from '@/services/itemService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Package, ImageOff, FileText, Star, Timer } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface RentalItem {
  id: string;
  name: string;
  description: string;
  images: string[];
  owner: {
    id: string;
    name: string;
    avatar: string;
  };
  [key: string]: any;
}

interface Rental {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  denial_reason?: string | null;
  item: RentalItem;
  [key: string]: any;
}

interface UserRentalsProps {
  onViewInvoice?: (rentalId: string) => void;
  onRateUser?: (userId: string, userName: string, rentalId: string) => void;
}

const UserRentals: React.FC<UserRentalsProps> = ({ onViewInvoice, onRateUser }) => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Update the current time every minute to refresh timers
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  const handleImageError = (rentalId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [rentalId]: true
    }));
  };

  // Calculate time remaining and progress for pending rentals
  const calculateTimeData = (createdAt: string) => {
    const created = new Date(createdAt);
    const expiresAt = new Date(created.getTime() + (3 * 60 * 60 * 1000)); // 3 hours later
    const now = currentTime;
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return { timeText: 'Expired', progressPercent: 0, isExpiringSoon: true };
    
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    
    // Calculate percentage of time remaining (from 100% to 0%)
    const totalWindowMs = 3 * 60 * 60 * 1000; // 3 hours in ms
    const progressPercent = Math.max(0, Math.min(100, (diff / totalWindowMs) * 100));
    
    const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    const isExpiringSoon = progressPercent < 30;
    
    return { timeText, progressPercent, isExpiringSoon };
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
            
            const isPending = rental.status === 'pending';
            const timeData = isPending ? calculateTimeData(rental.created_at) : null;
            
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
                          rental.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          rental.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                          rental.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          rental.status === 'declined' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="font-semibold">₹{rental.total_price}</p>
                  </div>

                  {/* Enhanced timer for pending rentals */}
                  {isPending && timeData && (
                    <div className="mt-4 bg-amber-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-amber-800">
                          <Timer className="w-4 h-4 mr-1" />
                          <span className="font-medium">Owner response time:</span>
                        </div>
                        <span className={`text-sm font-semibold ${
                          timeData.isExpiringSoon ? 'text-red-600' : 'text-amber-700'
                        }`}>
                          {timeData.timeText}
                        </span>
                      </div>
                      <div className="w-full">
                        <Progress 
                          value={timeData.progressPercent} 
                          className="h-2"
                          indicatorClassName={`${
                            timeData.progressPercent > 60 
                              ? 'bg-green-500' 
                              : timeData.progressPercent > 30 
                                ? 'bg-amber-500' 
                                : 'bg-red-500'
                          }`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {timeData.progressPercent <= 0 
                          ? "Request will auto-expire soon" 
                          : "Owner has 3 hours to respond"}
                      </p>
                    </div>
                  )}

                  {/* Show denial reason if rental was declined */}
                  {rental.status === 'declined' && rental.denial_reason && (
                    <div className="mt-3 bg-red-50 p-2 rounded-md">
                      <p className="text-xs font-medium text-red-800">Reason for declining:</p>
                      <p className="text-xs text-red-700">{rental.denial_reason}</p>
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-between items-center">
                    <Link 
                      to={`/item/${rental.item?.id}`}
                      className="text-sm text-rentmate-orange hover:underline"
                    >
                      View Details
                    </Link>

                    <div className="flex gap-2">
                      {/* Show rate owner button for completed rentals */}
                      {rental.status === 'completed' && onRateUser && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRateUser(
                            rental.item.owner.id, 
                            rental.item.owner.name,
                            rental.id
                          )}
                          className="text-xs flex items-center px-2 py-1"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Rate
                        </Button>
                      )}

                      {/* Show invoice button for approved/completed rentals */}
                      {(rental.status === 'approved' || rental.status === 'completed') && onViewInvoice && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => onViewInvoice(rental.id)}
                          className="text-xs flex items-center px-2 py-1"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Invoice
                        </Button>
                      )}
                    </div>
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
