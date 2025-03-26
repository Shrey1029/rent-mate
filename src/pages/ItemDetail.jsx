
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { format, addDays, differenceInDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { createRental } from "@/services/itemService";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 1));
  const [activeImage, setActiveImage] = useState("");
  const [rentalDays, setRentalDays] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isRentDialogOpen, setIsRentDialogOpen] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("items")
          .select(
            `
            *,
            item_images (id, image_url, is_primary),
            profiles:owner_id (id, full_name, avatar_url)
          `
          )
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching item:", error);
          navigate("/404");
          return;
        }

        const formattedItem = {
          ...data,
          images: data.item_images || [],
          owner: data.profiles,
        };

        setItem(formattedItem);
        
        // Set the active image to the primary image, or the first one if no primary
        const primaryImage = formattedItem.images.find(img => img.is_primary);
        setActiveImage(primaryImage ? primaryImage.image_url : 
                      formattedItem.images.length > 0 ? formattedItem.images[0].image_url : "");
      } catch (error) {
        console.error("Error in fetchItem:", error);
        navigate("/404");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id, navigate]);

  useEffect(() => {
    // Calculate rental days and total price when dates change
    if (startDate && endDate) {
      const days = Math.max(1, differenceInDays(endDate, startDate) + 1);
      setRentalDays(days);
      
      if (item) {
        setTotalPrice(item.price * days);
      }
    }
  }, [startDate, endDate, item]);

  const handleRent = async () => {
    if (!user) {
      toast.error("Please sign in to rent this item");
      navigate("/auth");
      return;
    }

    if (user.id === item.owner_id) {
      toast.error("You cannot rent your own item");
      return;
    }

    try {
      await createRental(item.id, startDate, endDate, totalPrice);
      toast.success("Rental request submitted successfully!");
      setIsRentDialogOpen(false);
    } catch (error) {
      console.error("Error creating rental:", error);
      toast.error("Failed to submit rental request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Item not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto py-8 px-4">
        <div className="mb-4">
          <Link to="/browse" className="text-primary hover:underline flex items-center gap-1">
            <span>← Back to Browse</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left side - Images */}
          <div>
            <div className="mb-4 rounded-lg overflow-hidden aspect-video bg-gray-100">
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {item.images.map((image) => (
                <div
                  key={image.id}
                  onClick={() => setActiveImage(image.image_url)}
                  className={`cursor-pointer aspect-square rounded-md overflow-hidden border-2 ${
                    activeImage === image.image_url
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Details */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">{item.name}</h1>
              <Badge variant={item.daily_rate ? "default" : "outline"}>
                {item.daily_rate ? "Daily Rate" : "Full Period"}
              </Badge>
            </div>

            <div className="text-2xl font-bold mb-4 text-primary">
              ₹{item.price} {item.daily_rate ? "/ day" : "for rental period"}
            </div>

            <div className="flex items-center mb-6">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={item.owner?.avatar_url} />
                <AvatarFallback>{item.owner?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{item.owner?.full_name || "Unknown owner"}</span>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-700">{item.description || "No description provided."}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label>Category</Label>
                <div>{item.category || "Uncategorized"}</div>
              </div>
              <div>
                <Label>Condition</Label>
                <div>{item.condition || "Not specified"}</div>
              </div>
              <div>
                <Label>Location</Label>
                <div>{item.location || "Not specified"}</div>
              </div>
            </div>

            <Dialog open={isRentDialogOpen} onOpenChange={setIsRentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mb-4">Rent Now</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rent {item.name}</DialogTitle>
                  <DialogDescription>
                    Select your rental period and confirm the details.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          if (date) {
                            setStartDate(date);
                            if (date > endDate) {
                              setEndDate(addDays(date, 1));
                            }
                          }
                        }}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                        disabled={(date) =>
                          date < addDays(startDate, 0)
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Rental Period:</span>
                      <span>
                        {format(startDate, "MMM dd, yyyy")} to{" "}
                        {format(endDate, "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{rentalDays} day{rentalDays !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total Price:</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRent}>Confirm Rental</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Rental Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Price:</span>
                    <span>₹{item.price} {item.daily_rate ? "/ day" : ""}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Availability:</span>
                    <span className="text-green-600">Available Now</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12">
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">About this item</h3>
                <p>{item.description || "No additional details provided."}</p>
              </div>
            </TabsContent>
            <TabsContent value="policies" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Rental Policies</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Return the item in the same condition you received it</li>
                  <li>Late returns may incur additional charges</li>
                  <li>Contact the owner immediately if item is damaged</li>
                  <li>Cancellations must be made at least 24 hours in advance</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ItemDetail;
