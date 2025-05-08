
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  User, UserCircle, Package, MessageSquare, 
  Settings, CreditCard, LogOut, ChevronRight, ChevronDown,
  AlertCircle, Clock, FileText, Star
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import UserItems from "@/components/UserItems";
import UserRentals from "@/components/UserRentals";
import ProfileForm from "@/components/ProfileForm";
import { 
  fetchOwnerRentals, 
  updateRentalStatus, 
  checkAndAutoRejectPendingRentals, 
  generateInvoiceData,
  getUserRating
} from "@/services/itemService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import InvoiceModal from "@/components/InvoiceModal";
import RatingModal from "@/components/RatingModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("my-rentals");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ownerRentals, setOwnerRentals] = useState([]);
  const [ownerRentalsLoading, setOwnerRentalsLoading] = useState(false);
  const [processingRentalId, setProcessingRentalId] = useState(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  
  // Denial reason state
  const [isDenialDialogOpen, setIsDenialDialogOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState(null);
  const [denialReason, setDenialReason] = useState("");
  const [isDenialReasonValid, setIsDenialReasonValid] = useState(true);
  const [isDenialSubmitting, setIsDenialSubmitting] = useState(false);
  
  // Confirmation dialog state
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    rentalId: string | null;
    action: 'approve' | 'decline';
  }>({ rentalId: null, action: 'approve' });

  // Invoice modal state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // Rating modal state
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [ratingInfo, setRatingInfo] = useState<{
    userId: string;
    userName: string;
    rentalId: string;
  } | null>(null);

  // Auto-check for pending rentals older than 3 hours
  useEffect(() => {
    if (!user) return;
    
    // Run once when component mounts
    checkAndAutoRejectPendingRentals();
    
    // Then set interval to check every minute
    const intervalId = setInterval(checkAndAutoRejectPendingRentals, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);

  // Fetch user rating
  useEffect(() => {
    if (user?.id) {
      loadUserRating();
    }
  }, [user?.id]);

  // Load user rating
  const loadUserRating = async () => {
    try {
      const rating = await getUserRating(user?.id);
      setUserRating(rating);
    } catch (error) {
      console.error("Error loading user rating:", error);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/auth');
      return;
    }
    
    // If user exists, we can stop the initial loading
    if (user) {
      setIsLoading(false);
    }
  }, [user, isLoading, navigate]);

  // Load owner rentals only when tab changes to 'orders'
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      loadOwnerRentals();
    }
  }, [activeTab, user]);

  // Function to load owner rentals
  const loadOwnerRentals = async () => {
    if (!user) return;
    
    setOwnerRentalsLoading(true);
    try {
      const data = await fetchOwnerRentals(user.id);
      console.log('Fetched owner rentals:', data);
      setOwnerRentals(data);
    } catch (error) {
      console.error('Error loading owner rentals:', error);
      toast.error('Failed to load rental requests');
    } finally {
      setOwnerRentalsLoading(false);
    }
  };

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

  // Open confirmation dialog
  const openConfirmDialog = (rentalId: string, action: 'approve' | 'decline') => {
    setConfirmAction({ rentalId, action });
    setIsConfirmDialogOpen(true);
  };

  // Open denial reason dialog
  const openDenialDialog = (rentalId: string) => {
    setSelectedRentalId(rentalId);
    setDenialReason("");
    setIsDenialReasonValid(true);
    setIsDenialDialogOpen(true);
  };

  // Open invoice modal
  const openInvoiceModal = async (rentalId: string) => {
    try {
      const data = await generateInvoiceData(rentalId);
      setInvoiceData(data);
      setIsInvoiceModalOpen(true);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice');
    }
  };

  // Open rating modal
  const openRatingModal = (userId: string, userName: string, rentalId: string) => {
    setRatingInfo({ userId, userName, rentalId });
    setIsRatingModalOpen(true);
  };

  // Handle rental status update
  const handleRentalStatusUpdate = async (rentalId: string, newStatus: string) => {
    try {
      setProcessingRentalId(rentalId);
      console.log(`Updating rental ${rentalId} status to ${newStatus}`);
      
      // If declining, open denial reason dialog instead of immediate update
      if (newStatus === 'declined') {
        openDenialDialog(rentalId);
        setProcessingRentalId(null);
        return;
      }
      
      const success = await updateRentalStatus(rentalId, newStatus);
      
      if (success) {
        // Update the local state to reflect the change
        setOwnerRentals(prevRentals => 
          prevRentals.map(rental => 
            rental.id === rentalId 
              ? { ...rental, status: newStatus } 
              : rental
          )
        );
        
        toast.success(`Rental request ${newStatus === 'approved' ? 'approved' : 'declined'} successfully`);
        
        // If approved, show invoice option
        if (newStatus === 'approved') {
          toast.success(
            "Rental approved! You can now generate an invoice.",
            {
              action: {
                label: "View Invoice",
                onClick: () => openInvoiceModal(rentalId)
              }
            }
          );
        }
      } else {
        toast.error(`Failed to ${newStatus === 'approved' ? 'approve' : 'decline'} the rental request`);
      }
    } catch (error) {
      console.error(`Error ${newStatus === 'approved' ? 'approving' : 'declining'} rental:`, error);
      toast.error(`Error: ${error.message || 'Something went wrong'}`);
    } finally {
      setProcessingRentalId(null);
    }
  };

  // Handle decline with reason submission
  const handleDeclineWithReason = async () => {
    if (!denialReason.trim()) {
      setIsDenialReasonValid(false);
      return;
    }
    
    setIsDenialSubmitting(true);
    
    try {
      // Add denial reason to the rental
      const success = await updateRentalStatus(selectedRentalId, 'declined', denialReason);
      
      if (success) {
        // Update local state
        setOwnerRentals(prevRentals => 
          prevRentals.map(rental => 
            rental.id === selectedRentalId 
              ? { ...rental, status: 'declined', denial_reason: denialReason } 
              : rental
          )
        );
        
        toast.success('Rental request declined');
        setIsDenialDialogOpen(false);
      } else {
        toast.error('Failed to decline the rental request');
      }
    } catch (error) {
      console.error('Error declining rental:', error);
      toast.error(`Error: ${error.message || 'Something went wrong'}`);
    } finally {
      setIsDenialSubmitting(false);
    }
  };

  // Calculate time remaining before auto-rejection
  const calculateTimeRemaining = (createdAt: string) => {
    const created = new Date(createdAt);
    const expiresAt = new Date(created.getTime() + (3 * 60 * 60 * 1000)); // 3 hours later
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Fixed error handler for image loading
  const handleImageError = (e) => {
    // Type-safe access to target properties
    const target = e.target as HTMLImageElement;
    if (target) {
      target.src = '/placeholder.svg';
    }
  };

  // User data from profile
  const userData = {
    name: profile?.full_name || user?.email?.split('@')[0] || "User",
    email: user?.email || "No email",
    avatar: profile?.avatar_url || "https://randomuser.me/api/portraits/women/63.jpg",
    joinedDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : "New user",
    location: profile?.location || "Location not set",
    rating: userRating || 'Not rated' // Use dynamically loaded rating
  };

  const menuItems = [
    { id: "my-rentals", label: "My Rentals", icon: Package },
    { id: "my-listings", label: "My Listings", icon: User },
    { id: "orders", label: "Rental Requests", icon: CreditCard },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  // Loading skeleton for dashboard
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-28">
          <div className="rentmate-container">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="hidden lg:block w-64 shrink-0">
                <div className="glass rounded-2xl p-6">
                  <Skeleton className="h-32 w-full mb-6" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <Skeleton className="h-12 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-40 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "my-rentals":
        return <UserRentals onViewInvoice={openInvoiceModal} onRateUser={openRatingModal} />;
      
      case "my-listings":
        return <UserItems />;
      
      case "orders":
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Rental Requests</h2>
            
            {ownerRentalsLoading ? (
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
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
                {ownerRentals.map((rental) => {
                  const isPending = rental.status === 'pending';
                  const timeRemaining = isPending ? calculateTimeRemaining(rental.created_at) : null;
                  
                  return (
                    <div key={rental.id} className="glass rounded-2xl p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div className="flex items-center mb-4 md:mb-0">
                          <div className="flex-shrink-0 mr-4">
                            {rental.item?.images && rental.item.images.length > 0 ? (
                              <img 
                                src={rental.item.images[0]} 
                                alt={rental.item.name || 'Item'} 
                                className="w-16 h-16 rounded-lg object-cover"
                                onError={handleImageError}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                <Package className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{rental.item?.name || 'Unknown Item'}</h3>
                            <p className="text-sm text-muted-foreground">
                              Rental #{rental.id.substring(0, 8)}
                            </p>
                            {isPending && (
                              <div className="flex items-center text-xs text-amber-600 mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>Time remaining: {timeRemaining}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            rental.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            rental.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                            rental.status === 'declined' ? 'bg-red-100 text-red-800' : 
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
                              onError={handleImageError}
                            />
                            {rental.renter?.full_name || 'Anonymous'}
                            {rental.status === 'completed' && (
                              <button 
                                onClick={() => openRatingModal(
                                  rental.renter_id, 
                                  rental.renter?.full_name || 'User',
                                  rental.id
                                )}
                                className="ml-2 text-xs text-rentmate-orange hover:underline flex items-center"
                              >
                                <Star className="h-3 w-3 mr-1" />
                                Rate
                              </button>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Amount</p>
                          <p className="text-sm font-medium">₹{rental.total_price}</p>
                        </div>
                      </div>

                      {/* Show denial reason if rental was declined */}
                      {rental.status === 'declined' && rental.denial_reason && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                          <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-800">Reason for declining:</p>
                              <p className="text-sm text-red-700">{rental.denial_reason}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-2">
                        <Link to={`/item/${rental.item?.id}`} className="text-sm text-rentmate-orange">
                          View Item
                        </Link>
                        
                        {/* Show invoice button for approved/completed rentals */}
                        {(rental.status === 'approved' || rental.status === 'completed') && (
                          <Button
                            size="sm" 
                            variant="outline"
                            onClick={() => openInvoiceModal(rental.id)}
                            className="px-4 py-1 text-sm flex items-center"
                          >
                            <FileText className="h-3 w-3 mr-2" />
                            Invoice
                          </Button>
                        )}
                        
                        {rental.status === 'pending' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => openConfirmDialog(rental.id, 'approve')}
                              className="px-4 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                              disabled={processingRentalId === rental.id}
                            >
                              {processingRentalId === rental.id ? 'Processing...' : 'Accept'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openConfirmDialog(rental.id, 'decline')}
                              className="px-4 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                              disabled={processingRentalId === rental.id}
                            >
                              {processingRentalId === rental.id ? 'Processing...' : 'Decline'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
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
            <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
            <div className="glass rounded-2xl p-6 mb-6">
              <ProfileForm />
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

  // Now the main content
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
                          onError={handleImageError}
                        />
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <h3 className="font-medium">{userData.name}</h3>
                      <p className="text-xs text-muted-foreground">{userData.email}</p>
                      <div className="mt-1">
                        {typeof userData.rating === 'number' ? (
                          <Badge variant="outline" className="bg-rentmate-gold/20 text-rentmate-gold">
                            <Star className="h-3 w-3 mr-1 fill-rentmate-gold" />
                            {userData.rating.toFixed(1)}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-500">
                            Not rated
                          </Badge>
                        )}
                      </div>
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
                      {typeof userData.rating === 'number' ? (
                        <Badge variant="outline" className="bg-rentmate-gold/20 text-rentmate-gold">
                          <Star className="h-3 w-3 mr-1 fill-rentmate-gold" />
                          {userData.rating.toFixed(1)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-500">
                          Not rated
                        </Badge>
                      )}
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

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction.action === 'approve' ? 'Approve Rental Request' : 'Decline Rental Request'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction.action === 'approve' 
                ? 'Are you sure you want to approve this rental request? This action cannot be undone.'
                : 'Are you sure you want to decline this rental request? You will need to provide a reason.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsConfirmDialogOpen(false);
                if (confirmAction.action === 'approve') {
                  handleRentalStatusUpdate(confirmAction.rentalId, 'approved');
                } else {
                  openDenialDialog(confirmAction.rentalId);
                }
              }}
              className={confirmAction.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {confirmAction.action === 'approve' ? 'Approve' : 'Continue to Decline'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Denial Reason Dialog */}
      <Dialog open={isDenialDialogOpen} onOpenChange={setIsDenialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Reason for Declining</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this rental request. This will be shown to the renter.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <Textarea
              value={denialReason}
              onChange={(e) => {
                setDenialReason(e.target.value);
                setIsDenialReasonValid(e.target.value.trim().length > 0);
              }}
              placeholder="Explain why you're declining this rental request..."
              className={`min-h-[100px] ${!isDenialReasonValid ? 'border-red-500' : ''}`}
            />
            {!isDenialReasonValid && (
              <p className="text-sm text-red-500 mt-1">A reason is required to decline the request</p>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDenialDialogOpen(false)}
              disabled={isDenialSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeclineWithReason}
              disabled={!denialReason.trim() || isDenialSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDenialSubmitting ? 'Submitting...' : 'Decline Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoiceData={invoiceData}
      />

      {/* Rating Modal */}
      {ratingInfo && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          userId={ratingInfo.userId}
          userName={ratingInfo.userName}
          rentalId={ratingInfo.rentalId}
          onRatingSubmitted={loadUserRating}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default Dashboard;
