
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  User, UserCircle, Package, MessageSquare, 
  Settings, CreditCard, LogOut, ChevronRight, ChevronDown 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import UserItems from "@/components/UserItems";
import UserRentals from "@/components/UserRentals";
import { fetchOwnerRentals } from "@/services/itemService";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("my-rentals");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ownerRentals, setOwnerRentals] = useState<any[]>([]);
  const [ownerRentalsLoading, setOwnerRentalsLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    location: ''
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  // Load initial data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Load owner rentals when tab changes
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      const loadOwnerRentals = async () => {
        setOwnerRentalsLoading(true);
        try {
          const data = await fetchOwnerRentals(user.id);
          setOwnerRentals(data);
        } catch (error) {
          console.error('Error loading owner rentals:', error);
        } finally {
          setOwnerRentalsLoading(false);
        }
      };

      loadOwnerRentals();
    }
  }, [activeTab, user]);

  // Set form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        location: profile.location || ''
      });
    }
  }, [profile]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      await updateProfile({
        full_name: formData.full_name,
        location: formData.location
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // User data from profile
  const userData = {
    name: profile?.full_name || user?.email?.split('@')[0] || "User",
    email: user?.email || "No email",
    avatar: profile?.avatar_url || "https://randomuser.me/api/portraits/women/63.jpg",
    joinedDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : "New user",
    location: profile?.location || "Location not set",
    rating: 4.9 // Default rating since it's not stored in auth
  };

  const menuItems = [
    { id: "my-rentals", label: "My Rentals", icon: Package },
    { id: "my-listings", label: "My Listings", icon: User },
    { id: "orders", label: "Rental Requests", icon: CreditCard },
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
        return <UserRentals />;
      
      case "my-listings":
        return <UserItems />;
      
      case "orders":
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Rental Requests</h2>
            
            {ownerRentalsLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-rentmate-orange border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground">Loading rental requests...</p>
              </div>
            ) : ownerRentals.length === 0 ? (
              <div className="glass p-12 rounded-2xl text-center">
                <h3 className="text-lg font-medium mb-2">No rental requests</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any rental requests yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ownerRentals.map((rental) => (
                  <div key={rental.id} className="glass rounded-2xl p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div className="flex items-center mb-4 md:mb-0">
                        <div className="flex-shrink-0 mr-4">
                          {rental.item.images && rental.item.images.length > 0 ? (
                            <img 
                              src={rental.item.images[0].image_url} 
                              alt={rental.item.name} 
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{rental.item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Rental #{rental.id.substring(0, 8)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          rental.status === 'active' ? 'bg-green-100 text-green-800' : 
                          rental.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                          rental.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Rental Period</p>
                        <p className="text-sm">
                          {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Renter</p>
                        <p className="text-sm flex items-center">
                          <img 
                            src={rental.renter?.avatar_url || '/placeholder.svg'} 
                            alt={rental.renter?.full_name || 'Renter'} 
                            className="w-4 h-4 rounded-full mr-1"
                          />
                          {rental.renter?.full_name || 'Anonymous'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                        <p className="text-sm font-medium">${rental.total_price}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Link to={`/item/${rental.item.id}`} className="text-sm text-rentmate-orange">
                        View Item
                      </Link>
                      {rental.status === 'pending' && (
                        <>
                          <button className="px-4 py-1 text-sm bg-green-500 text-white rounded-lg">
                            Accept
                          </button>
                          <button className="px-4 py-1 text-sm bg-gray-300 text-gray-700 rounded-lg">
                            Decline
                          </button>
                        </>
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
              <div className="flex items-center justify-center mb-6">
                <ProfileImageUpload />
              </div>
              
              <h3 className="text-lg font-medium mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={userData.email}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rentmate-orange"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  className="button-primary bg-rentmate-orange text-white py-2 px-4"
                  onClick={handleProfileUpdate}
                >
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
                    <ProfileImageUpload />
                    <h3 className="font-medium text-lg mt-2">{userData.name}</h3>
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
