
import React, { useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Upload, Trash2, Loader2, Check } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { suggestCategories } from '@/services/mlService';

const CreateItemForm = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isDailyRate, setIsDailyRate] = useState(true);
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('Excellent');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleCategoryAutoSuggest = async () => {
    if (description.length < 10) return;
    
    setIsSuggesting(true);
    try {
      const categories = await suggestCategories(description);
      setSuggestedCategories(categories);
    } catch (error) {
      console.error("Error suggesting categories:", error);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    setUploading(true);
    
    const newImages = [...images];
    
    for (const file of files) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }
      
      const id = uuidv4();
      
      try {
        // Create a preview
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        newImages.push({
          id,
          file,
          preview: URL.createObjectURL(file),
          uploading: true
        });
        
        setImages([...newImages]);
      } catch (error) {
        console.error('Error creating preview:', error);
        toast.error(`Failed to process ${file.name}`);
      }
    }
    
    setUploading(false);
  };
  
  const handleRemoveImage = (id) => {
    setImages(images.filter(img => img.id !== id));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !description || !price) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to create an item');
        return;
      }
      
      // Create item
      const { data: item, error: itemError } = await supabase
        .from('items')
        .insert([{
          name,
          description,
          price: parseFloat(price),
          daily_rate: isDailyRate,
          category,
          condition,
          owner_id: user.id
        }])
        .select()
        .single();
      
      if (itemError) throw itemError;
      
      // Upload images
      const imagePromises = images.map(async (img, index) => {
        const filePath = `${item.id}/${uuidv4()}`;
        
        const { error: uploadError } = await supabase.storage
          .from('item_images')
          .upload(filePath, img.file);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('item_images')
          .getPublicUrl(filePath);
        
        return {
          item_id: item.id,
          image_url: urlData.publicUrl,
          is_primary: index === 0
        };
      });
      
      const uploadedImages = await Promise.all(imagePromises);
      
      // Insert image records
      const { error: imagesError } = await supabase
        .from('item_images')
        .insert(uploadedImages);
      
      if (imagesError) throw imagesError;
      
      toast.success('Item created successfully!');
      
      // Clear form
      setName('');
      setDescription('');
      setPrice('');
      setIsDailyRate(true);
      setCategory('');
      setCondition('Excellent');
      setImages([]);
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Add New Listing</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Item Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What are you renting out?"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <div className="relative">
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Electronics, Furniture, Tools"
                list="category-suggestions"
              />
              {isSuggesting && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {suggestedCategories.length > 0 && (
                <datalist id="category-suggestions">
                  {suggestedCategories.map((cat, index) => (
                    <option key={index} value={cat} />
                  ))}
                </datalist>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Price (₹) *</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price in Rupees"
                required
                className="flex-1"
              />
              <div className="flex rounded-md border overflow-hidden">
                <button
                  type="button"
                  className={`px-3 py-2 text-sm ${isDailyRate ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                  onClick={() => setIsDailyRate(true)}
                >
                  Per Day
                </button>
                <button
                  type="button"
                  className={`px-3 py-2 text-sm ${!isDailyRate ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                  onClick={() => setIsDailyRate(false)}
                >
                  Per Week
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="Brand New">Brand New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description *</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleCategoryAutoSuggest}
            placeholder="Describe your item in detail (condition, specifications, rules, etc.)"
            className="h-24"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Images * (Maximum 5)
          </label>
          
          <div className="flex flex-wrap gap-4 mb-2">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative w-24 h-24 border rounded-md overflow-hidden group"
              >
                <img
                  src={img.preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Trash2 className="h-5 w-5 text-white" />
                </button>
              </div>
            ))}
            
            {images.length < 5 && (
              <label className="w-24 h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                <Upload className="h-5 w-5 mb-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            Supported formats: JPG, PNG, GIF (max 5MB each)
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={isSubmitting || uploading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Listing'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateItemForm;
