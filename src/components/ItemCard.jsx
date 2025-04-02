
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { deleteItem } from "@/services/itemService";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ItemCard = ({ 
  item, 
  featured = false, 
  onDelete,
  showDeleteButton = false 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Default placeholder image if no images are available
  const imageUrl = item.images && item.images.length > 0 
    ? item.images[0] 
    : 'https://via.placeholder.com/400x300?text=No+Image';

  console.log('Rendering ItemCard with image:', imageUrl);

  const handleDelete = async (e) => {
    e.preventDefault(); // Prevent navigation to item detail
    e.stopPropagation(); // Stop event propagation
    
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      const success = await deleteItem(item.id);
      
      if (success) {
        toast.success("Item deleted successfully");
        // Call the onDelete callback if provided
        if (onDelete) {
          onDelete(item.id);
        }
      } else {
        toast.error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("An error occurred while deleting the item");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div
        className={cn(
          "group relative rounded-2xl overflow-hidden animated-card bg-white",
          featured ? "shadow-lg" : "shadow-subtle"
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <div
            className={cn(
              "absolute inset-0 bg-muted/20 backdrop-blur-sm flex items-center justify-center transition-opacity",
              isLoaded ? "opacity-0" : "opacity-100"
            )}
          >
            <div className="w-10 h-10 rounded-full border-2 border-rentmate-orange border-t-transparent animate-spin"></div>
          </div>
          <img
            src={imageUrl}
            alt={item.name}
            className={cn(
              "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setIsLoaded(true)}
            onError={(e) => {
              console.error('Image failed to load');
              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error';
              setIsLoaded(true);
            }}
          />
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-colors",
                  isLiked ? "fill-rentmate-orange text-rentmate-orange" : "text-muted-foreground"
                )}
              />
            </button>
            
            {showDeleteButton && item.owner && user && user.id === item.owner.id && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white hover:text-red-500 transition-colors"
                aria-label="Delete item"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
          {item.status === "rented" && (
            <div className="absolute top-0 left-0 right-0 bg-rentmate-charcoal/80 text-white text-xs font-medium py-1 px-3 text-center">
              Currently Rented
            </div>
          )}
          {featured && (
            <div className="absolute top-3 left-3 bg-rentmate-gold text-rentmate-charcoal text-xs font-medium py-1 px-3 rounded-full">
              Featured
            </div>
          )}
        </div>

        <Link to={`/item/${item.id}`} className="block p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="card-title text-base font-semibold line-clamp-1">{item.name}</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-primary">₹{item.price.toFixed(0)}</span>
              <span className="text-sm text-muted-foreground">/{item.priceUnit}</span>
            </div>
            <div className="flex items-center text-sm">
              <Star className="h-4 w-4 text-rentmate-gold fill-rentmate-gold mr-1" />
              <span>{item.owner.rating}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-muted flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={item.owner.avatar}
                alt={item.owner.name}
                className="w-6 h-6 rounded-full mr-2"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150';
                }}
              />
              <span className="text-xs text-muted-foreground">
                {item.owner.name}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{item.location}</span>
          </div>
        </Link>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your item 
              "{item.name}" and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ItemCard;
