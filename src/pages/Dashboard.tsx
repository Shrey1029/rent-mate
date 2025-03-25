import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  User, UserCircle, Package, MessageSquare, 
  Settings, CreditCard, LogOut, Plus, ChevronRight, ChevronDown 
} from "lucide-react";
import { items } from "@/lib/data";
import ItemCard from "@/components/ItemCard";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("my-rentals");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  // User data from Supabase auth
  const userData = {
    name: user?.user_metadata?.name || user?.email?.split('@')[0] || "User",
    email: user?.email || "No email",
    avatar: user?.user_metadata?.avatar_url || "https://randomuser.me/api/portraits/women/63.jpg",
    joinedDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : "New user",
    location: user?.user_metadata?.location || "Location not set",
    rating: 4.9 // Default rating since it's not stored in auth
  };

  // Mock data for items and orders (would eventually come from database)
  const mockMyRentals = items.slice(0, 2);
  const mockMyListings = items.slice(3, 5);
  const mockRentalHistory = [...items.slice(5, 6), ...items.slice(2, 3)];

  const mockOrders = [
    {
      id: "order-1",
      item: items[0],
      status: "Active",
      startDate: "2023-06-10",
      endDate: "2023-06-15",
      totalAmount: 225
    },
    {
      id: "order-2",
      item: items[3],
      status: "Completed",
      startDate: "2023-05-20",
      endDate: "2023-05-22",
      totalAmount: 60
    }
  ];

  const menuItems = [
    { id: "my-rentals", label: "My Rentals", icon: Package },
    { id: "my-listings", label: "My Listings", icon: User },
    { id: "rental-history", label: "Rental History", icon: Package },
    { id: "orders", label: "Orders", icon: CreditCard },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  // Render different content based on active tab
  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-rentmate-orange border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "my-rentals":
        return (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Rentals</h2>
              <button className="button-primary bg-rentmate-orange text-white py-2 px-4 flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add New Listing
              </button>
            </div>
            
            {mockMyRentals.length === 0 ? (
              <div className="glass p-12 rounded-2xl text-center">
                <h3 className="text-lg font-medium mb-2">No rental items</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't rented any items yet.
                </p>
                <Link to="/browse" className="button-primary bg-rentmate-orange text-white">
                  Browse Items
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockMyRentals.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        );
      
      case "my-listings":
        return (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Listings</h2>
              <button className="button-primary bg-rentmate-orange text-white py-2 px-4 flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add New Listing
              </button>
            </div>
            
            {mockMyListings.length === 0 ? (
              <div className="glass p-12 rounded-2xl text-center">
                <h3 className="text-lg font-medium mb-2">No listings yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't added any items for rent.
                </p>
                <button className="button-primary bg-rentmate-orange text-white">
                  Add Your First Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockMyListings.map(item => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        );
      
      case "rental-history":
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Rental History</h2>
            
            {mockRentalHistory.length === 0 ? (
              <div className="glass p-12 rounded-2xl text-center">
                <h3 className="text-lg font-medium mb-2">No rental history</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't rented any items yet.
                </p>
                <Link to="/browse" className="button-primary bg-rentmate-orange text-white">
                  Browse Items
                </Link>
              </div>
            ) : (
              <div className="glass rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4">Item</th>
                      <th className="text-left p-4 hidden md:table-cell">Date</th>
                      <th className="text-left p-4 hidden md:table-cell">Owner</th>
                      <th className="text-left p-4">Price</th>
                      <th className="text-left p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockRentalHistory.map((item, index) => (
                      <tr key={item.id} className="border-t border-border">
                        <td className="p-4">
                          <div className="flex items-center">
                            <img 
                              src={item.images[0]} 
                              alt={item.name} 
                              className="w-12 h-12 rounded-lg object-cover mr-3"
                            />
                            <div className="truncate">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(2023, 5 - index, 15).toLocaleDateString()} - {new Date(2023, 5 - index, 18).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          {new Date(2023, 5 - index, 15).toLocaleDateString()}
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="flex items-center">
                            <img 
                              src={item.owner.avatar} 
                              alt={item.owner.name} 
                              className="w-6 h-6 rounded-full mr-2"
                            />
                            {item.owner.name}
                          </div>
                        </td>
                        <td className="p-4 font-medium">
                          ${item.price * 3}
                        </td>
                        <td className="p-4">
                          <Link to={`/item/${item.id}`} className="text-rentmate-orange hover:underline text-sm">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      
      case "orders":
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">My Orders</h2>
            
            {mockOrders.length === 0 ? (
              <div className="glass p-12 rounded-2xl text-center">
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't placed any orders yet.
                </p>
                <Link to="/browse" className="button-primary bg-rentmate-orange text-white">
                  Browse Items
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {mockOrders.map(order => (
                  <div key={order.id} className="glass rounded-2xl p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div className="flex items-center mb-4 md:mb-0">
                        <div className="flex-shrink-0 mr-4">
                          <img 
                            src={order.item.images[0]} 
                            alt={order.item.name} 
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{order.item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          order.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Rental Period</p>
                        <p className="text-sm">
                          {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Owner</p>
                        <p className="text-sm flex items-center">
                          <img 
                            src={order.item.owner.avatar} 
                            alt={order.item.owner.name} 
                            className="w-4 h-4 rounded-full mr-1"
                          />
                          {order.item.owner.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                        <p className="text-sm font-medium">${order.totalAmount}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Link to={`/item/${order.item.id}`} className="text-sm text-rentmate-orange">
                        View Item
                      </Link>
                      {order.status === 'Active' && (
                        <button className="px-4 py-1 text-sm bg-rentmate-orange text-white rounded-lg">
                          Return Item
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case "messages":
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Messages</h2>
            <div className="glass p-12 rounded-2xl text-center">
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-muted-foreground mb-4">
                When you communicate with other users, your messages will appear here.
              </p>
            </div>
          </div>
        );
      
      case "settings":
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
            <div className="glass rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={userData.name}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={userData.email}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    defaultValue={userData.location}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="button-primary bg-rentmate-orange text-white py-2 px-4">
                  Save Changes
                </button>
              </div>
            </div>
            
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-medium mb-4">Account Security</h3>
              <button className="w-full text-left px-4 py-3 rounded-xl border border-gray-300 hover:bg-muted transition-colors mb-3 flex items-center justify-between">
                <span>Change Password</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl border border-gray-300 hover:bg-muted transition-colors mb-3 flex items-center justify-between">
                <span>Two-Factor Authentication</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="w-full text-left px-4 py-3 rounded-xl border border-gray-300 hover:bg-muted transition-colors flex items-center justify-between">
                <span>Connected Accounts</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <p>Select a menu item from the sidebar to view your account details.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-28">
        <div className="rentmate-container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile menu toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full flex items-center justify-between glass p-4 rounded-xl mb-3"
              >
                <div className="flex items-center">
                  <UserCircle className="h-5 w-5 mr-2" />
                  <span>Dashboard Menu</span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    isMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isMenuOpen && (
                <div className="glass rounded-2xl p-4 mb-4 animate-fade-in">
                  <div className="flex items-center justify-center mb-4 p-4">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 relative">
                        <img
                          src={userData.avatar}
                          alt={userData.name}
                          className="rounded-full w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <h3 className="font-medium">{userData.name}</h3>
                      <p className="text-xs text-muted-foreground">{userData.email}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {menuItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center p-3 rounded-lg text-sm ${
                          activeTab === item.id
                            ? "bg-rentmate-orange text-white"
                            : "hover:bg-secondary"
                        }`}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.label}
                      </button>
                    ))}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center p-3 rounded-lg text-sm text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - desktop */}
            <div className="hidden lg:block w-64 shrink-0">
              <div className="glass rounded-2xl p-6 sticky top-28">
                <div className="flex items-center justify-center mb-6 p-4">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-3 relative">
                      <img
                        src={userData.avatar}
                        alt={userData.name}
                        className="rounded-full w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <h3 className="font-medium text-lg">{userData.name}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{userData.email}</p>
                    <div className="flex items-center justify-center">
                      <div className="flex items-center">
                        <span className="text-xs bg-rentmate-gold/20 text-rentmate-gold px-2 py-0.5 rounded-full">
                          ★ {userData.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {menuItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center p-3 rounded-lg text-sm ${
                        activeTab === item.id
                          ? "bg-rentmate-orange text-white"
                          : "hover:bg-secondary"
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </button>
                  ))}
                  <div className="pt-4 mt-4 border-t border-border">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center p-3 rounded-lg text-sm text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
