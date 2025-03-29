
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, differenceInDays, addDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { createRental } from "@/services/itemService";
import { CalendarIcon, ChevronLeft, Star, MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 2),
  });
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate rental days and total price
  const rentalDays = date.to
    ? differenceInDays(date.to, date.from) + 1
    : 1;
  const totalPrice = item?.price ? item.price * rentalDays : 0;

  // Fetch item data
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
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
          console.error("Error fetching item:", error);
          toast.error("Failed to load item details");
          navigate("/404");
          return;
        }

        if (!data) {
          navigate("/404");
          return;
        }

        // Format the data for display
        setItem({
          ...data,
          images: data.item_images?.map((img) => img.image_url) || [],
          owner: {
            id: data.profiles?.id,
            name: data.profiles?.full_name || "Unknown",
            avatar: data.profiles?.avatar_url || "https://via.placeholder.com/150",
            rating: 4.8, // Default rating
          },
          priceUnit: data.daily_rate ? "day" : "rental",
        });
      } catch (error) {
        console.error("Error:", error);
        toast.error("An unexpected error occurred");
        navigate("/404");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id, navigate]);

  const handleRent = async () => {
    if (!user) {
      toast.error("Please sign in to rent this item");
      navigate("/auth");
      return;
    }

    if (user.id === item.owner.id) {
      toast.error("You cannot rent your own item");
      return;
    }

    setIsSubmitting(true);
    try {
      await createRental(
        item.id,
        date.from,
        date.to,
        totalPrice
      );

      toast.success("Rental request submitted successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating rental:", error);
      toast.error("Failed to submit rental request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === item.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? item.images.length - 1 : prevIndex - 1
    );
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8 animate-pulse">
          <div className="w-20 h-8 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-[4/3] bg-gray-200 rounded-xl"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="h-20 bg-gray-200 rounded mb-6"></div>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Item not found
  if (!item) return null;

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Link
          to="/browse"
          className="inline-flex items-center text-rentmate-orange mb-8 hover:underline"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Browse
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Item Images */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted shadow-subtle">
              {item.images.length > 0 ? (
                <>
                  <img
                    src={item.images[currentImageIndex]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {item.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center rotate-180"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}
            </div>

            {item.images.length > 1 && (
              <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
                {item.images.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-16 h-16 rounded-md overflow-hidden shrink-0 ${
                      currentImageIndex === index
                        ? "ring-2 ring-rentmate-orange"
                        : "opacity-70"
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`${item.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{item.name}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-rentmate-gold fill-rentmate-gold mr-1" />
                  <span className="text-sm">{item.owner.rating}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {item.location}
                </div>
              </div>
            </div>

            <div className="text-xl md:text-2xl font-bold">
              ₹{item.price} <span className="text-sm font-normal">per {item.priceUnit}</span>
            </div>

            <div>
              <h3 className="text-md font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Category</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {item.category || "Not specified"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Condition</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {item.condition || "Not specified"}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={item.owner.avatar}
                    alt={item.owner.name}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <div>
                    <p className="font-medium">{item.owner.name}</p>
                    <p className="text-xs text-muted-foreground">Owner</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental options */}
            {showDateSelector ? (
              <div className="border border-border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Select rental period</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDateSelector(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date.from ? (
                              format(date.from, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date.from}
                            onSelect={(day) =>
                              setDate((prev) => ({
                                from: day,
                                to: prev.to && day > prev.to ? addDays(day, 1) : prev.to,
                              }))
                            }
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date.to ? (
                              format(date.to, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date.to}
                            onSelect={(day) =>
                              setDate((prev) => ({
                                from: prev.from,
                                to: day,
                              }))
                            }
                            initialFocus
                            disabled={(date) =>
                              date < new Date() || (date?.from && date < date.from)
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="bg-muted/30 p-3 rounded space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>₹{item.price.toFixed(0)} × {rentalDays} {rentalDays === 1 ? 'day' : 'days'}</span>
                      <span>₹{totalPrice.toFixed(0)}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-medium">
                      <span>Total</span>
                      <span>₹{totalPrice.toFixed(0)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleRent}
                    className="w-full bg-rentmate-orange hover:bg-rentmate-orange/90"
                    disabled={isSubmitting || !date.from || !date.to}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      "Rent Now"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowDateSelector(true)}
                className="w-full bg-rentmate-orange hover:bg-rentmate-orange/90"
                disabled={user?.id === item.owner.id}
              >
                {user?.id === item.owner.id ? (
                  <span className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Your Item
                  </span>
                ) : (
                  "Rent This Item"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ItemDetail;
