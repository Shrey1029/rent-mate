
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ItemOwner {
  id: string;
  name: string;
  avatar: string;
  rating: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  priceUnit: string;
  category: string;
  location: string;
  images: string[];
  owner: ItemOwner;
  status?: string;
}

interface ItemCardProps {
  item: Item;
  featured?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, featured = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
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
          src={item.images[0]}
          alt={item.name}
          className={cn(
            "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors z-10"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isLiked ? "fill-rentmate-orange text-rentmate-orange" : "text-muted-foreground"
            )}
          />
        </button>
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
            />
            <span className="text-xs text-muted-foreground">
              {item.owner.name}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{item.location}</span>
        </div>
      </Link>
    </div>
  );
};

export default ItemCard;
