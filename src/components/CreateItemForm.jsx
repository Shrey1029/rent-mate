
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { createItem } from '@/services/itemService';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { suggestCategories } from '@/services/mlService';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// List of Indian campus locations
const indianLocations = [
  "RBU Nagpur",
  "VNIT Nagpur",
  "Symbiosis Nagpur",
  "IIT Mumbai",
  "Delhi University",
  "IIM Ahmedabad",
  "BITS Pilani",
  "Pune University",
  "Anna University Chennai",
  "Manipal University"
];

const CreateItemForm = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [dailyRate, setDailyRate] = useState(false);
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);

  // Fetch suggested categories when description changes
  useEffect(() => {
    if (description.length > 20) {
      handleSuggestCategories();
    }
  }, [description]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a listing.');
      navigate('/auth');
      return;
    }

    if (!name || !description || price === '' || !category || !condition || images.length === 0) {
      toast.error('Please fill in all required fields and upload at least one image.');
      return;
    }

    setIsLoading(true);
    try {
      const priceValue = parseFloat(price);
      if (isNaN(priceValue)) {
        throw new Error('Price must be a number.');
      }

      await createItem(
        {
          name,
          description,
          price: priceValue,
          daily_rate: dailyRate,
          category,
          condition,
          location
        },
        user.id,
        images
      );
      toast.success('Item created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Item creation error:', error);
      toast.error(error.message || 'Failed to create item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (!e.target.files) return;
    setImages(Array.from(e.target.files));
  };

  const handleSuggestCategories = async () => {
    if (!description || description.length < 10) {
      return;
    }
    
    try {
      const suggestions = await suggestCategories(description);
      setCategoryOptions(suggestions);
      if (suggestions.length > 0 && !category) {
        setCategory(suggestions[0]);
        toast.success(`Suggested category: ${suggestions[0]}`);
      }
    } catch (error) {
      console.error('Error getting category suggestions:', error);
    }
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Item Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
            placeholder="e.g., Mountain Bike"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Price (₹) *
          </label>
          <input
            type="text"
            id="price"
            value={price}
            onChange={handlePriceChange}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
            placeholder="e.g., 500"
            required
          />
        </div>
      </div>

      <div className="form-group mt-4">
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
          placeholder="e.g., Great condition mountain bike for rent"
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="form-group">
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category *
          </label>
          <div className="flex gap-2">
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {[...new Set([...categoryOptions, "Electronics", "Furniture", "Tools", "Sports", "Books", "Clothing", "Vehicles", "Other"])].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={handleSuggestCategories}
              disabled={isLoading || description.length < 10}
              className="px-3 py-2 bg-rentmate-gold text-black rounded-xl hover:bg-rentmate-gold/90 transition-colors text-sm"
            >
              Suggest
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location" className="block text-sm font-medium mb-1">
            Location *
          </label>
          <Select 
            value={location}
            onValueChange={setLocation}
          >
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent>
              {indianLocations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="form-group">
          <label htmlFor="condition" className="block text-sm font-medium mb-1">
            Condition *
          </label>
          <Select
            value={condition}
            onValueChange={setCondition}
          >
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="Select Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="like new">Like New</SelectItem>
              <SelectItem value="used - excellent">Used - Excellent</SelectItem>
              <SelectItem value="used - good">Used - Good</SelectItem>
              <SelectItem value="used - fair">Used - Fair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="form-group">
          <div className="flex items-center h-full pt-6">
            <input
              type="checkbox"
              id="dailyRate"
              checked={dailyRate}
              onChange={(e) => setDailyRate(e.target.checked)}
              className="mr-2 h-5 w-5 text-rentmate-orange focus:ring-rentmate-orange rounded"
            />
            <label htmlFor="dailyRate" className="text-sm font-medium">
              Daily Rate (uncheck for weekly)
            </label>
          </div>
        </div>
      </div>

      <div className="form-group mt-4">
        <label htmlFor="images" className="block text-sm font-medium mb-1">
          Images * (Maximum 5)
        </label>
        <input
          type="file"
          id="images"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border border-gray-300 rounded-xl p-2"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Upload up to 5 high-quality images. First image will be the main display image.
        </p>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <button
          type="button"
          className="button-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="button-primary bg-rentmate-orange text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creating...
            </div>
          ) : (
            'Create Listing'
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateItemForm;
