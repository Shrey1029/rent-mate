
import React, { useState } from 'react';
import { toast } from 'sonner';
import { createItem } from '@/services/itemService';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
// Import the ML service
import { suggestCategories } from '@/services/mlService';

const CreateItemForm = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [dailyRate, setDailyRate] = useState(false);
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState('');

  const locations = [
    'RBU Nagpur',
    'VNIT Nagpur',
    'Symbiosis Nagpur',
    'IIIT Nagpur',
    'IIM Nagpur',
    'AIIMS Nagpur',
    'RCOEM Nagpur',
    'Shivaji Nagar',
    'Dharampeth'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to create a listing.');
      navigate('/auth');
      return;
    }

    if (!name || !description || price === '' || !category || !condition || images.length === 0 || !location) {
      toast.error('Please fill in all required fields and upload at least one image.');
      return;
    }

    setIsLoading(true);
    try {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice)) {
        throw new Error('Price must be a number.');
      }

      await createItem(
        {
          name,
          description,
          price: numPrice,
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

  // Inside the component, add this function to handle category suggestions:
  const handleSuggestCategories = async () => {
    if (!description || description.length < 10) {
      toast.error('Please enter a longer description for better suggestions');
      return;
    }
    
    setIsLoading(true);
    try {
      const suggestions = await suggestCategories(description);
      if (suggestions.length > 0) {
        setCategory(suggestions[0]);
        if (suggestions.length > 1) {
          toast.success(`Suggested categories: ${suggestions.join(', ')}`);
        } else {
          toast.success(`Suggested category: ${suggestions[0]}`);
        }
      } else {
        toast.info('No specific category suggestions found. Please select manually.');
      }
    } catch (error) {
      console.error('Error getting category suggestions:', error);
      toast.error('Failed to suggest categories');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
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
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
          placeholder="e.g., Great condition mountain bike for rent"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="price" className="block text-sm font-medium mb-1">
          Price *
        </label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
          placeholder="e.g., 25"
          required
        />
      </div>

      <div className="form-group">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="dailyRate"
            checked={dailyRate}
            onChange={(e) => setDailyRate(e.target.checked)}
            className="mr-2 h-5 w-5 text-rentmate-orange focus:ring-rentmate-orange rounded"
          />
          <label htmlFor="dailyRate" className="text-sm font-medium">
            Daily Rate
          </label>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          Category *
        </label>
        <div className="flex gap-2">
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
            placeholder="e.g., Electronics, Furniture"
            required
          />
          <button
            type="button"
            onClick={handleSuggestCategories}
            disabled={isLoading}
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
        <select
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
          required
        >
          <option value="">Select Location</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="condition" className="block text-sm font-medium mb-1">
          Condition *
        </label>
        <select
          id="condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
          required
        >
          <option value="">Select Condition</option>
          <option value="new">New</option>
          <option value="like new">Like New</option>
          <option value="used - excellent">Used - Excellent</option>
          <option value="used - good">Used - Good</option>
          <option value="used - fair">Used - Fair</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="images" className="block text-sm font-medium mb-1">
          Images *
        </label>
        <input
          type="file"
          id="images"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
          required
        />
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
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Create Listing'
          )}
        </button>
      </div>
    </form>
  );
};

export default CreateItemForm;
