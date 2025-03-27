
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import CreateItemForm from "./CreateItemForm";
import ItemCard from "./ItemCard";

const UserItems = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserItems();
    }
  }, [user]);

  const fetchUserItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("items")
        .select(`
          id,
          name,
          description,
          price,
          daily_rate,
          category,
          condition,
          location,
          created_at,
          item_images (
            id,
            image_url,
            is_primary
          )
        `)
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const formattedItems = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        priceUnit: item.daily_rate ? "day" : "rental",
        category: item.category,
        condition: item.condition,
        location: item.location || "Not specified",
        images: item.item_images.map((img) => img.image_url),
        owner: {
          name: user.user_metadata.full_name || user.email.split("@")[0],
          avatar: user.user_metadata.avatar_url || "https://via.placeholder.com/150",
          rating: "4.8" // Default rating
        },
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error("Error fetching user items:", error);
      toast.error("Failed to load your listings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    fetchUserItems();
    toast.success("Item listed successfully!");
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-subtle animate-fade-in">
        <h2 className="text-xl font-bold mb-4">Create New Listing</h2>
        <CreateItemForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Your Listings</h2>
        <Button onClick={() => setShowCreateForm(true)} className="bg-rentmate-orange hover:bg-rentmate-orange/90">
          <Plus className="h-4 w-4 mr-1" /> New Listing
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-xl">
          <h3 className="font-medium text-lg mb-2">No Listings Yet</h3>
          <p className="text-muted-foreground mb-4">
            You haven't listed any items for rent yet.
          </p>
          <Button onClick={() => setShowCreateForm(true)} className="bg-rentmate-orange hover:bg-rentmate-orange/90">
            <Plus className="h-4 w-4 mr-1" /> Create Your First Listing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserItems;
