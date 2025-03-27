
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Star, Calendar, MapPin, Clock, Info, ArrowRight } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, addDays, differenceInDays } from "date-fns";
import { createRental } from "@/services/itemService";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [rentalDuration, setRentalDuration] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data, error } = await supabase
          .from("items")
          .select(`
            *,
            item_images (id, image_url, is_primary),
            profiles:owner_id (id, full_name, avatar_url)
          `)
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        // Format the item data
        const formattedItem = {
          ...data,
          images: data.item_images || [],
          owner: data.profiles || {},
          location: data.location || "Not specified", // Add default location
        };
        
        setItem(formattedItem);
      } catch (error) {
        console.error("Error fetching item:", error);
        toast.error("Could not load item details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  const handleRentNow = async () => {
    if (!user) {
      toast.error("Please log in to rent this item");
      navigate("/auth");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a start date");
      return;
    }

    if (user.id === item.owner_id) {
      toast.error("You cannot rent your own item");
      return;
    }

    try {
      const startDate = selectedDate;
      const endDate = addDays(startDate, rentalDuration);
      const totalPrice = item.price * rentalDuration;

      await createRental(item.id, startDate, endDate, totalPrice);
      toast.success("Rental request submitted successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating rental:", error);
      toast.error("Failed to create rental request");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-rentmate-orange border-t-transparent"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
            <p className="mb-6">The item you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/browse")}>
              Back to Browse
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setCalendarOpen(false);
  };

  return (
    <>
      <Navbar />
      <main className="py-28">
        <div className="rentmate-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image gallery */}
            <div>
              <div className="rounded-xl overflow-hidden aspect-square mb-4">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[activeImageIndex].image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    No images available
                  </div>
                )}
              </div>
              
              {/* Thumbnail gallery */}
              {item.images && item.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {item.images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`cursor-pointer rounded-lg overflow-hidden w-20 h-20 flex-shrink-0 transition-all ${
                        index === activeImageIndex
                          ? "ring-2 ring-rentmate-orange"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img
                        src={image.image_url}
                        alt={`${item.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Item details */}
            <div className="glass p-6 rounded-2xl">
              <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
              
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{item.location}</span>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  Listed {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  <img
                    src={item.owner?.avatar_url || "/placeholder.svg"}
                    alt={item.owner?.full_name || "Owner"}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-sm font-medium">
                      {item.owner?.full_name || "Anonymous"}
                    </p>
                    <div className="flex items-center text-xs text-rentmate-gold">
                      <Star className="h-3 w-3 mr-1 fill-rentmate-gold" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-baseline mb-4">
                <span className="text-2xl font-bold text-rentmate-orange">
                  ₹{item.price}
                </span>
                <span className="text-sm text-muted-foreground ml-1">
                  / {item.daily_rate ? "day" : "rental"}
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass p-3 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <p className="font-medium">
                    {item.category || "Uncategorized"}
                  </p>
                </div>
                <div className="glass p-3 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">Condition</p>
                  <p className="font-medium">
                    {item.condition || "Not specified"}
                  </p>
                </div>
              </div>
              
              {/* Rental form */}
              <div>
                <h3 className="text-lg font-medium mb-4">Reserve this item</h3>
                
                <div className="mb-4">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP")
                        ) : (
                          <span>Pick a start date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Rental Duration (days)
                  </label>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setRentalDuration(Math.max(1, rentalDuration - 1))}
                      disabled={rentalDuration <= 1}
                    >
                      -
                    </Button>
                    <span className="mx-4 font-medium">{rentalDuration}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setRentalDuration(rentalDuration + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                {selectedDate && (
                  <div className="glass p-4 rounded-xl mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Start Date</span>
                      <span className="font-medium">
                        {format(selectedDate, "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">End Date</span>
                      <span className="font-medium">
                        {format(
                          addDays(selectedDate, rentalDuration),
                          "MMM d, yyyy"
                        )}
                      </span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total</span>
                        <span className="font-bold">
                          ₹{item.price * rentalDuration}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button
                  className="w-full bg-rentmate-orange hover:bg-rentmate-orange/90"
                  size="lg"
                  onClick={handleRentNow}
                  disabled={!selectedDate}
                >
                  Rent Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="flex items-start mt-4 text-xs text-muted-foreground">
                  <Info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <p>
                    Rental requests need to be accepted by the owner before they
                    are confirmed. You will not be charged until the owner accepts
                    your request.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ItemDetail;
