
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addUserRating } from '@/services/itemService';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  rentalId: string;
  onRatingSubmitted?: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  userName, 
  rentalId, 
  onRatingSubmitted 
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await addUserRating(
        userId,
        rating,
        comment.trim() || null,
        rentalId
      );
      
      if (success) {
        toast.success("Rating submitted successfully");
        if (onRatingSubmitted) onRatingSubmitted();
        onClose();
        // Reset form
        setRating(0);
        setComment('');
      } else {
        toast.error("Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("An error occurred while submitting your rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate {userName}</DialogTitle>
          <DialogDescription>
            Share your experience with this transaction
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="mx-1 focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  size={32}
                  className={`${
                    (hoverRating || rating) >= star
                      ? "fill-rentmate-gold text-rentmate-gold" 
                      : "text-gray-300"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Comment (optional)
            </label>
            <Textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
