
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Calendar, Share, Flag, Star, ChevronLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { fetchItemById, createRental } from "@/services/itemService";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const data = await fetchItemById(id);
        setItem(data);
      } catch (error) {
        console.error("Error loading item:", error);
        toast.error("Failed to load item details");
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [id]);

  const handleImageClick = (index) => {
    setActiveImage(index);
  };

  const handleRental = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to rent this item");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      toast.error("End date must be after start date");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRental({
        item_id: item.id,
        renter_id: user.id,
        start_date: startDate,
        end_date: endDate,
        total_price: calculateTotalPrice(),
      });

      toast.success("Rental request submitted successfully!");
      setStartDate(null);
      setEndDate(null);
    } catch (error) {
      console.error("Error creating rental:", error);
      toast.error("Failed to submit rental request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate the total price based on the rental period
  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !item) return 0;
    
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const rentalDays = item.daily_rate ? days : Math.ceil(days / 7);
    
    return rentalDays * (item.price * 83); // Convert to Indian Rupees
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-28">
          <div className="rentmate-container">
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-rentmate-orange border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-28">
          <div className="rentmate-container">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Item Not Found</h2>
              <p className="mt-4">The item you're looking for doesn't exist or has been removed.</p>
              <Link to="/browse" className="inline-block mt-6 button-primary bg-rentmate-orange text-white">
                Browse Items
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-28">
        <div className="rentmate-container">
          <div className="mb-6">
            <Link to="/browse" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Browse
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Item Images */}
            <div>
              <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-4">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[activeImage]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">No image available</p>
                  </div>
                )}
              </div>

              {item.images && item.images.length > 1 && (
                <div className="flex overflow-x-auto space-x-2 pb-2">
                  {item.images.map((image, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer ${
                        activeImage === index ? "ring-2 ring-rentmate-orange" : ""
                      }`}
                      onClick={() => handleImageClick(index)}
                    >
                      <img src={image} alt={`${item.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{item.name}</h1>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                    <span className="text-muted-foreground">{item.location || "Location not specified"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs bg-rentmate-gold/20 text-rentmate-gold px-2 py-0.5 rounded-full flex items-center">
                      <Star className="h-3 w-3 mr-1 fill-rentmate-gold" />
                      {item.rating || 5.0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <span className="text-2xl font-bold text-primary">₹{(item.price * 83).toFixed(0)}</span>
                  <span className="text-muted-foreground ml-1">/{item.daily_rate ? 'day' : 'week'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-xs px-2 py-1 bg-teal-50 text-teal-800 rounded-full">
                    {item.category || "Uncategorized"}
                  </div>
                  <div className="text-xs px-2 py-1 bg-blue-50 text-blue-800 rounded-full">
                    {item.condition || "Condition not specified"}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{item.description || "No description provided."}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Owner</h3>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={item.owner?.avatar || '/placeholder.svg'} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{item.owner?.name || "Anonymous"}</p>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-rentmate-gold mr-1 fill-rentmate-gold" />
                      <span className="text-xs text-muted-foreground">{item.owner?.rating || 5.0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-xl">
                <h3 className="text-lg font-medium mb-4">Rent this item</h3>
                <form onSubmit={handleRental}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        value={startDate || ""}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        value={endDate || ""}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
                        required
                      />
                    </div>
                  </div>

                  {startDate && endDate && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total Price:</span>
                        <span>₹{calculateTotalPrice().toFixed(0)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full button-primary bg-rentmate-orange text-white py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      "Request to Rent"
                    )}
                  </button>
                </form>
              </div>

              <div className="flex divide-x divide-gray-300">
                <button className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </button>
                <button className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ItemDetail;
