import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getItemById, getCategoryById, items } from "@/lib/data";
import { Star, MapPin, Calendar, ChevronLeft, ChevronRight, ArrowLeft, ChevronDown } from "lucide-react";
import ItemCard from "@/components/ItemCard";

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const item = getItemById(id || "");
  const category = item ? getCategoryById(item.category) : null;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDateSelectorOpen, setIsDateSelectorOpen] = useState(false);

  const similarItems = items
    .filter(i => i.id !== id && i.category === item?.category)
    .slice(0, 3);

  const calculatePrice = () => {
    if (!startDate || !endDate || !item) return { days: 0, total: 0 };
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      days,
      total: days * item.price
    };
  };

  const { days, total } = calculatePrice();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 pb-16">
          <div className="rentmate-container text-center">
            <h1 className="text-3xl font-bold mb-4">Item Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The item you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/browse"
              className="button-primary bg-rentmate-orange text-white inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === item.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? item.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="page-transition min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="rentmate-container">
          <div className="mb-6">
            <Link
              to="/browse"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to results
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-3/5">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4">
                {isLoading ? (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-rentmate-orange border-t-transparent animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <img
                      src={item.images[currentImageIndex]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    {item.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 glass p-2 rounded-full shadow-lg hover:bg-white/80 transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 glass p-2 rounded-full shadow-lg hover:bg-white/80 transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>

              {item.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {item.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`rounded-lg overflow-hidden aspect-square border-2 ${
                        currentImageIndex === index
                          ? "border-rentmate-orange"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${item.name} - view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-2">Description</h2>
                <p className="text-muted-foreground mb-6">{item.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="glass rounded-xl p-4">
                    <h3 className="text-sm font-medium mb-1">Category</h3>
                    <p className="text-muted-foreground">{category?.name}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="text-sm font-medium mb-1">Condition</h3>
                    <p className="text-muted-foreground">{item.condition}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="text-sm font-medium mb-1">Location</h3>
                    <p className="text-muted-foreground">{item.location}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <h3 className="text-sm font-medium mb-1">Status</h3>
                    <p className="text-muted-foreground capitalize">{item.status}</p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-4">About the Owner</h2>
                <div className="glass rounded-xl p-4 mb-6">
                  <div className="flex items-center">
                    <img
                      src={item.owner.avatar}
                      alt={item.owner.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="font-medium">{item.owner.name}</h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-rentmate-gold fill-rentmate-gold mr-1" />
                        <span className="text-sm">{item.owner.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-2/5">
              <div className="glass rounded-2xl shadow-lg p-6 sticky top-28">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold mb-2">{item.name}</h1>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-rentmate-orange">
                        ${item.price}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        /{item.priceUnit}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="text-sm text-muted-foreground">
                        {item.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">Rental Period</h3>
                  <div className="relative">
                    <button
                      onClick={() => setIsDateSelectorOpen(!isDateSelectorOpen)}
                      className="glass w-full p-3 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {startDate && endDate
                            ? `${new Date(startDate).toLocaleDateString()} - ${new Date(
                                endDate
                              ).toLocaleDateString()}`
                            : "Select dates"}
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isDateSelectorOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isDateSelectorOpen && (
                      <div className="absolute top-full left-0 right-0 z-10 mt-2 glass rounded-xl p-4 shadow-xl animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="w-full p-2 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-rentmate-orange"
                              min={new Date().toISOString().split("T")[0]}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="w-full p-2 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-rentmate-orange"
                              min={
                                startDate ||
                                new Date().toISOString().split("T")[0]
                              }
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => setIsDateSelectorOpen(false)}
                          className="w-full mt-3 p-2 bg-rentmate-orange text-white rounded-lg"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-2">Price Summary</h3>
                    <div className="glass rounded-xl p-4">
                      <div className="flex justify-between mb-2">
                        <span>
                          ${item.price} × {days} days
                        </span>
                        <span>${item.price * days}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Service fee</span>
                        <span>${Math.floor(total * 0.1)}</span>
                      </div>
                      <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>${total + Math.floor(total * 0.1)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  className={`w-full py-3 rounded-xl font-medium ${
                    item.status === "available"
                      ? "bg-rentmate-orange text-white hover:bg-rentmate-orange/90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                  disabled={item.status !== "available" || !startDate || !endDate}
                >
                  {item.status === "available"
                    ? startDate && endDate
                      ? "Rent Now"
                      : "Select Dates to Rent"
                    : "Currently Unavailable"}
                </button>

                {item.status !== "available" && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    This item is currently being rented by someone else.
                  </p>
                )}
              </div>
            </div>
          </div>

          {similarItems.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Similar Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ItemDetail;
