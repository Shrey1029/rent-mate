
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import ItemCard from "@/components/ItemCard";
import { categories } from "@/lib/data";
import { Sliders, Grid, List, ChevronDown } from "lucide-react";
import { fetchItems } from "@/services/itemService";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Browse = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";
  const initialLocation = searchParams.get("location") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCondition, setSelectedCondition] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all items from Supabase
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      try {
        const items = await fetchItems();
        console.log("Fetched items:", items);
        setAllItems(items);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching items:", error);
        toast.error("Failed to load items");
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  // Filter items based on search parameters
  useEffect(() => {
    if (allItems.length === 0) return;

    let filtered = [...allItems];

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Condition filter
    if (selectedCondition) {
      filtered = filtered.filter(item => item.condition === selectedCondition);
    }

    // Price range filter
    filtered = filtered.filter(
      item => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    // Search filter
    if (initialSearch) {
      const searchLower = initialSearch.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    // Location filter
    if (initialLocation) {
      const locationLower = initialLocation.toLowerCase();
      filtered = filtered.filter(item =>
        item.location && item.location.toLowerCase().includes(locationLower)
      );
    }

    console.log("Filtered items:", filtered);
    setFilteredItems(filtered);
  }, [selectedCategory, selectedCondition, priceRange, initialSearch, initialLocation, allItems]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-transition min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="rentmate-container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Browse Items</h1>
            <p className="text-muted-foreground">
              {filteredItems.length} items available to rent
            </p>
          </div>

          <div className="mb-6">
            <SearchBar withFilters={true} />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters sidebar - desktop */}
            <div className="hidden lg:block w-64 shrink-0">
              <div className="glass rounded-2xl p-6 sticky top-28">
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Categories</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${
                        selectedCategory === ""
                          ? "bg-rentmate-orange text-white"
                          : "hover:bg-secondary"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${
                          selectedCategory === category.id
                            ? "bg-rentmate-orange text-white"
                            : "hover:bg-secondary"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">Condition</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCondition("")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${
                        selectedCondition === ""
                          ? "bg-rentmate-orange text-white"
                          : "hover:bg-secondary"
                      }`}
                    >
                      Any Condition
                    </button>
                    <button
                      onClick={() => setSelectedCondition("Like New")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${
                        selectedCondition === "Like New"
                          ? "bg-rentmate-orange text-white"
                          : "hover:bg-secondary"
                      }`}
                    >
                      Like New
                    </button>
                    <button
                      onClick={() => setSelectedCondition("Excellent")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${
                        selectedCondition === "Excellent"
                          ? "bg-rentmate-orange text-white"
                          : "hover:bg-secondary"
                      }`}
                    >
                      Excellent
                    </button>
                    <button
                      onClick={() => setSelectedCondition("Good")}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm ${
                        selectedCondition === "Good"
                          ? "bg-rentmate-orange text-white"
                          : "hover:bg-secondary"
                      }`}
                    >
                      Good
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2">Price Range (₹)</h3>
                  <div className="px-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">₹{priceRange[0]}</span>
                      <span className="text-sm">₹{priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange[1]}
                      onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedCondition("");
                    setPriceRange([0, 5000]);
                  }}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Mobile filters */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between glass p-3 rounded-xl mb-3"
              >
                <div className="flex items-center">
                  <Sliders className="h-5 w-5 mr-2" />
                  <span>Filters</span>
                </div>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showFilters && (
                <div className="glass rounded-2xl p-4 mb-4 animate-fade-in">
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory("")}
                        className={`px-3 py-1 rounded-full text-xs ${
                          selectedCategory === ""
                            ? "bg-rentmate-orange text-white"
                            : "bg-secondary"
                        }`}
                      >
                        All
                      </button>
                      {categories.map(category => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`px-3 py-1 rounded-full text-xs ${
                            selectedCategory === category.id
                              ? "bg-rentmate-orange text-white"
                              : "bg-secondary"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Condition</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCondition("")}
                        className={`px-3 py-1 rounded-full text-xs ${
                          selectedCondition === ""
                            ? "bg-rentmate-orange text-white"
                            : "bg-secondary"
                        }`}
                      >
                        Any
                      </button>
                      <button
                        onClick={() => setSelectedCondition("Like New")}
                        className={`px-3 py-1 rounded-full text-xs ${
                          selectedCondition === "Like New"
                            ? "bg-rentmate-orange text-white"
                            : "bg-secondary"
                        }`}
                      >
                        Like New
                      </button>
                      <button
                        onClick={() => setSelectedCondition("Excellent")}
                        className={`px-3 py-1 rounded-full text-xs ${
                          selectedCondition === "Excellent"
                            ? "bg-rentmate-orange text-white"
                            : "bg-secondary"
                        }`}
                      >
                        Excellent
                      </button>
                      <button
                        onClick={() => setSelectedCondition("Good")}
                        className={`px-3 py-1 rounded-full text-xs ${
                          selectedCondition === "Good"
                            ? "bg-rentmate-orange text-white"
                            : "bg-secondary"
                        }`}
                      >
                        Good
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Price Range (₹)</h3>
                    <div className="px-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">₹{priceRange[0]}</span>
                        <span className="text-sm">₹{priceRange[1]}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        value={priceRange[1]}
                        onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedCondition("");
                      setPriceRange([0, 5000]);
                    }}
                    className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* Items grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {loading ? "Loading items..." : `Showing ${filteredItems.length} results`}
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md ${
                      viewMode === "grid" ? "bg-secondary" : ""
                    }`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md ${
                      viewMode === "list" ? "bg-secondary" : ""
                    }`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="glass rounded-xl overflow-hidden shadow-sm">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="glass p-12 rounded-2xl text-center">
                  <h3 className="text-lg font-medium mb-2">No items found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try changing your filters or search criteria
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedCondition("");
                      setPriceRange([0, 5000]);
                    }}
                    className="button-primary bg-rentmate-orange text-white"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                      : "space-y-4"
                  }
                >
                  {filteredItems.map(item => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Browse;
