
export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  priceUnit: string;
  images: string[];
  owner: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  location: string;
  condition: string;
  featured: boolean;
  status: "available" | "rented";
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  rating: number;
  joinedDate: string;
}

export const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    icon: "💻",
    description: "Cameras, laptops, audio equipment and more"
  },
  {
    id: "furniture",
    name: "Furniture",
    icon: "🪑",
    description: "Chairs, desks, tables, and more"
  },
  {
    id: "tools",
    name: "Tools",
    icon: "🔧",
    description: "Power tools, hand tools, and equipment"
  },
  {
    id: "vehicles",
    name: "Vehicles",
    icon: "🚗",
    description: "Cars, bikes, scooters, and more"
  },
  {
    id: "clothing",
    name: "Clothing",
    icon: "👕",
    description: "Formal wear, costumes, and accessories"
  },
  {
    id: "sports",
    name: "Sports",
    icon: "⚽",
    description: "Gear for all sports and outdoor activities"
  },
  {
    id: "books",
    name: "Books",
    icon: "📚",
    description: "Textbooks, novels, and educational materials"
  },
  {
    id: "events",
    name: "Event Equipment",
    icon: "🎉",
    description: "Party supplies, AV equipment, and more"
  }
];

export const items: Item[] = [
  {
    id: "item-1",
    name: "Sony Alpha A7 III Camera",
    description: "Professional mirrorless camera with 24.2MP full-frame sensor. Includes 28-70mm lens kit, perfect for photography enthusiasts and professionals alike.",
    category: "electronics",
    price: 45,
    priceUnit: "day",
    images: [
      "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/243757/pexels-photo-243757.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/3602258/pexels-photo-3602258.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    ],
    owner: {
      id: "user-1",
      name: "Michael Chen",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4.8
    },
    location: "San Francisco, CA",
    condition: "Like New",
    featured: true,
    status: "available"
  },
  {
    id: "item-2",
    name: "MacBook Pro 16-inch",
    description: "Latest model with M1 Pro chip, 16GB RAM, and 512GB SSD. Perfect for video editing, programming, or any intensive computing tasks.",
    category: "electronics",
    price: 35,
    priceUnit: "day",
    images: [
      "https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/326518/pexels-photo-326518.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    ],
    owner: {
      id: "user-2",
      name: "Emma Wilson",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 4.9
    },
    location: "Austin, TX",
    condition: "Excellent",
    featured: true,
    status: "available"
  },
  {
    id: "item-3",
    name: "Modern Mid-Century Sofa",
    description: "Stylish and comfortable 3-seater sofa with premium fabric upholstery. Perfect for temporary home staging or events.",
    category: "furniture",
    price: 25,
    priceUnit: "day",
    images: [
      "https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/1571470/pexels-photo-1571470.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    ],
    owner: {
      id: "user-3",
      name: "James Rodriguez",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      rating: 4.7
    },
    location: "Chicago, IL",
    condition: "Good",
    featured: false,
    status: "available"
  },
  {
    id: "item-4",
    name: "Specialized Tarmac Road Bike",
    description: "High-performance carbon fiber road bike. Size 56cm, perfect for racing or recreational cycling. Includes helmet and basic accessories.",
    category: "sports",
    price: 30,
    priceUnit: "day",
    images: [
      "https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/5466290/pexels-photo-5466290.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    ],
    owner: {
      id: "user-4",
      name: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/22.jpg",
      rating: 5.0
    },
    location: "Boulder, CO",
    condition: "Excellent",
    featured: true,
    status: "available"
  },
  {
    id: "item-5",
    name: "Dewalt Power Drill Set",
    description: "Complete 20V MAX cordless drill set with two batteries, charger, and carrying case. Includes various drill bits and accessories.",
    category: "tools",
    price: 15,
    priceUnit: "day",
    images: [
      "https://images.pexels.com/photos/209235/pexels-photo-209235.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    ],
    owner: {
      id: "user-5",
      name: "David Brown",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      rating: 4.6
    },
    location: "Portland, OR",
    condition: "Good",
    featured: false,
    status: "available"
  },
  {
    id: "item-6",
    name: "Tesla Model 3",
    description: "Electric sedan with long-range battery. Features autopilot capabilities and premium interior. Perfect for weekend getaways or special occasions.",
    category: "vehicles",
    price: 85,
    priceUnit: "day",
    images: [
      "https://images.pexels.com/photos/112460/pexels-photo-112460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    ],
    owner: {
      id: "user-6",
      name: "Alex Morgan",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      rating: 4.9
    },
    location: "Seattle, WA",
    condition: "Like New",
    featured: true,
    status: "available"
  },
  {
    id: "item-7",
    name: "DJI Mavic Air 2 Drone",
    description: "Compact drone with 4K camera, 34-minute flight time, and advanced features. Includes extra batteries and carrying case.",
    category: "electronics",
    price: 40,
    priceUnit: "day",
    images: [
      "https://images.pexels.com/photos/336232/pexels-photo-336232.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "https://images.pexels.com/photos/442589/pexels-photo-442589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    ],
    owner: {
      id: "user-7",
      name: "Ryan Thompson",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      rating: 4.7
    },
    location: "Los Angeles, CA",
    condition: "Excellent",
    featured: false,
    status: "available"
  },
  {
    id: "item-8",
    name: "Formal Tuxedo Set",
    description: "Classic black tuxedo with white shirt and bow tie. Size 40R, perfect for weddings, galas, and formal events.",
    category: "clothing",
    price: 30,
    priceUnit: "day",
    images: [
      "https://images.pexels.com/photos/937481/pexels-photo-937481.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    ],
    owner: {
      id: "user-8",
      name: "Olivia Martinez",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      rating: 4.8
    },
    location: "New York, NY",
    condition: "Like New",
    featured: true,
    status: "available"
  }
];

export const users: User[] = [
  {
    id: "user-1",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.8,
    joinedDate: "January 2022"
  },
  {
    id: "user-2",
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4.9,
    joinedDate: "March 2021"
  },
  {
    id: "user-3",
    name: "James Rodriguez",
    email: "james.rodriguez@example.com",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    rating: 4.7,
    joinedDate: "October 2022"
  }
];

export const getFeaturedItems = () => {
  return items.filter(item => item.featured);
};

export const getItemsByCategory = (categoryId: string) => {
  return items.filter(item => item.category === categoryId);
};

export const getItemById = (id: string) => {
  return items.find(item => item.id === id);
};

export const getCategoryById = (id: string) => {
  return categories.find(category => category.id === id);
};
