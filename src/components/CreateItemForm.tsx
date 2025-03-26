
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image as ImageIcon, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { createItem, NewItem } from '@/services/itemService';
import { useAuth } from '@/hooks/useAuth';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type CreateItemFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
const categories = [
  'Electronics',
  'Furniture',
  'Home Appliances',
  'Garden Tools',
  'Sports Equipment',
  'Clothing',
  'Books',
  'Tools',
  'Toys & Games',
  'Musical Instruments',
  'Vehicles',
  'Other'
];

const CreateItemForm = ({ onSuccess, onCancel }: CreateItemFormProps) => {
  const { user } = useAuth();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewItem>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      daily_rate: true,
      category: '',
      condition: ''
    }
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Limit to 5 images
    if (selectedImages.length + files.length > 5) {
      toast.error('You can only upload up to 5 images');
      return;
    }

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB size limit`);
        return;
      }

      newFiles.push(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviews.push(event.target.result as string);
          if (newPreviews.length === newFiles.length) {
            setImagePreviews([...imagePreviews, ...newPreviews]);
            setSelectedImages([...selectedImages, ...newFiles]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    const newPreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const onSubmit = async (data: NewItem) => {
    if (!user) {
      toast.error('You must be logged in to create an item');
      return;
    }

    if (selectedImages.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setIsSubmitting(true);

    try {
      await createItem(data, user.id, selectedImages);
      toast.success('Item created successfully');
      onSuccess();
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-lg font-semibold mb-4">Create New Listing</h3>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-3">Item Images (Up to 5)</p>
        <div className="flex flex-wrap gap-4 mb-3">
          {imagePreviews.map((src, index) => (
            <div key={index} className="relative w-20 h-20">
              <img
                src={src}
                alt={`Preview ${index}`}
                className="w-full h-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-white p-1 rounded-full shadow-md"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
          
          {selectedImages.length < 5 && (
            <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-rentmate-orange transition-colors">
              <ImageIcon className="w-6 h-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Add</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
            </label>
          )}
        </div>
        {selectedImages.length === 0 && (
          <p className="text-xs text-muted-foreground">Please add at least one image</p>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            rules={{ required: 'Item name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter item name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your item"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              rules={{
                required: 'Price is required',
                min: { value: 0.01, message: 'Price must be greater than 0' }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                      <Input
                        type="number"
                        className="pl-6"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="daily_rate"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Rate Type</FormLabel>
                  <FormControl>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-input"
                      value={field.value ? 'daily' : 'fixed'}
                      onChange={e => field.onChange(e.target.value === 'daily')}
                    >
                      <option value="daily">Daily Rate</option>
                      <option value="fixed">Fixed Price</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-input"
                      {...field}
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              rules={{ required: 'Condition is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <FormControl>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-input"
                      {...field}
                    >
                      <option value="" disabled>
                        Select condition
                      </option>
                      {conditions.map(condition => (
                        <option key={condition} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rentmate-orange text-white rounded-lg text-sm flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Listing
                </>
              )}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateItemForm;
