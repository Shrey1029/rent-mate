
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Calendar, Star, User, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("items")
          .select(`*, item_images(*)`)
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          setItem(data);

          // Fetch owner profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.owner_id)
            .single();

          if (profileError) throw profileError;
          setOwnerProfile(profileData);
        }
      } catch (error) {
        console.error("Error fetching item:", error);
        toast.error("Failed to load item details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const rentalDays = item.daily_rate ? days : Math.ceil(days / 7);
    
    return rentalDays * (item.price * 83); // Convert to Indian Rupees
  };

  const handleRent = async () => {
    if (!user) {
      toast.error("Please sign in to rent this item");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }

    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }

    setIsSubmitting(true);
    try {
      const totalPrice = calculateTotalPrice();

      const { data, error } = await supabase.from("rentals").insert([
        {
          item_id: id,
          renter_id: user.id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          total_price: totalPrice,
          status: "pending",
          message: message || null,
        },
      ]);

      if (error) throw error;

      toast.success("Rental request submitted successfully!");
      setStartDate(null);
      setEndDate(null);
      setMessage("");
    } catch (error) {
      console.error("Error submitting rental request:", error);
      toast.error("Failed to submit rental request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-16">
          <div className="w-16 h-16 border-4 border-rentmate-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Item Not Found</h2>
            <p className="text-muted-foreground">
              The item you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="rentmate-container">
          {/* Image Gallery and Item Info */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-10">
            {/* Image Gallery */}
            <div className="lg:col-span-3">
              <div className="relative rounded-2xl overflow-hidden mb-4 aspect-[4/3]">
                {item.item_images && item.item_images.length > 0 ? (
                  <img
                    src={item.item_images[selectedImage].image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    No image available
                  </div>
                )}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                >
                  <Heart
                    className={cn(
                      "h-6 w-6 transition-colors",
                      isLiked ? "fill-rentmate-orange text-rentmate-orange" : "text-muted-foreground"
                    )}
                  />
                </button>
              </div>

              {/* Thumbnail Gallery */}
              {item.item_images && item.item_images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {item.item_images.map((image, index) => (
                    <div
                      key={image.id}
                      className={cn(
                        "cursor-pointer rounded-lg overflow-hidden h-20 border-2",
                        selectedImage === index
                          ? "border-rentmate-orange"
                          : "border-transparent"
                      )}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={image.image_url}
                        alt={`${item.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Item Info */}
            <div className="lg:col-span-2">
              <div className="glass p-6 rounded-2xl h-full">
                <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 text-rentmate-gold fill-rentmate-gold mr-1" />
                    <span>4.8</span>
                    <span className="text-muted-foreground ml-1">(24 reviews)</span>
                  </div>
                  <span className="mx-2">•</span>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>Mumbai, India</span>
                  </div>
                </div>

                <div className="flex items-center mb-2">
                  <span className="text-2xl font-bold text-primary">₹{(item.price * 83).toFixed(0)}</span>
                  <span className="text-muted-foreground ml-1">/{item.daily_rate ? 'day' : 'week'}</span>
                </div>

                <p className="text-muted-foreground mb-6">{item.description}</p>

                <div className="border-t border-border pt-4 mb-6">
                  <h3 className="font-semibold mb-2">Item Details</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="text-muted-foreground">Category</div>
                    <div>{item.category || "Uncategorized"}</div>
                    <div className="text-muted-foreground">Condition</div>
                    <div>{item.condition || "Not specified"}</div>
                    <div className="text-muted-foreground">Available from</div>
                    <div>Immediately</div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <h3 className="font-semibold mb-3">Owner</h3>
                  <div className="flex items-center">
                    {ownerProfile?.avatar_url ? (
                      <img
                        src={ownerProfile.avatar_url}
                        alt={ownerProfile.full_name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted mr-3 flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">
                        {ownerProfile?.full_name || "Owner"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Member since{" "}
                        {ownerProfile?.created_at
                          ? format(
                              new Date(ownerProfile.created_at),
                              "MMMM yyyy"
                            )
                          : "recently"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Form */}
          <div className="glass p-6 rounded-2xl mb-10">
            <h2 className="text-xl font-bold mb-4">Rent This Item</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left w-full",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Pick a start date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left w-full",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP")
                      ) : (
                        <span>Pick an end date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) =>
                        date < (startDate || new Date())
                      }
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium block mb-2">
                Message to Owner (Optional)
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself and explain why you want to rent this item..."
                className="h-24"
              />
            </div>

            <div className="bg-muted/30 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">
                  Price per {item.daily_rate ? "day" : "week"}
                </span>
                <span>₹{(item.price * 83).toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">Duration</span>
                <span>
                  {startDate && endDate
                    ? Math.ceil(
                        (endDate.getTime() - startDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0}{" "}
                  days
                </span>
              </div>
              <div className="border-t border-border my-2"></div>
              <div className="flex items-center justify-between font-semibold">
                <span>Total Price:</span>
                <span>₹{calculateTotalPrice().toFixed(0)}</span>
              </div>
            </div>

            <Button
              className="w-full"
              disabled={isSubmitting || !user}
              onClick={handleRent}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : user ? (
                "Request to Rent"
              ) : (
                "Sign in to Rent"
              )}
            </Button>
          </div>

          {/* Additional Information */}
          <div className="glass p-6 rounded-2xl mb-10">
            <h2 className="text-xl font-bold mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-rentmate-orange" />
                  Rental Process
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Submit a rental request with your preferred dates</li>
                  <li>Owner reviews and approves your request</li>
                  <li>
                    Connect with the owner to arrange pickup/delivery details
                  </li>
                  <li>Enjoy your rental for the specified duration</li>
                  <li>Return the item in the same condition</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-rentmate-orange" />
                  Renter Responsibilities
                </h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Take care of the item as if it were your own</li>
                  <li>Return the item on time and in the same condition</li>
                  <li>Report any issues immediately</li>
                  <li>
                    Present valid ID during pickup (as required by the owner)
                  </li>
                </ul>
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
