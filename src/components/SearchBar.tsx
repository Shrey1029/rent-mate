
import React, { useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { categories } from "@/lib/data";
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

interface SearchBarProps {
  className?: string;
  withFilters?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ className = "", withFilters = false }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [location, setLocation] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    
    if (searchTerm) queryParams.set("search", searchTerm);
    if (selectedCategory && selectedCategory !== "all") queryParams.set("category", selectedCategory);
    if (location && location !== "all") queryParams.set("location", location);
    
    navigate(`/browse?${queryParams.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`glass rounded-full p-1 ${className} ${withFilters ? "flex-col" : "flex"}`}
    >
      <div className="flex items-center w-full">
        <Search className="h-5 w-5 text-muted-foreground ml-4 mr-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="What do you want to rent?"
          className="flex-1 bg-transparent border-none focus:outline-none py-3 px-1 text-foreground"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="p-1 mr-1"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        <button
          type="submit"
          className="button-primary py-2 px-6 rounded-full bg-rentmate-orange text-white"
        >
          Search
        </button>
      </div>

      {withFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 border-t border-border mt-2">
          <div className="flex items-center rounded-full bg-background px-3 py-1">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="bg-transparent border-none focus:outline-none text-sm px-2 min-h-0 h-auto">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center rounded-full bg-background px-3 py-1">
            <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
            <Select
              value={location}
              onValueChange={setLocation}
            >
              <SelectTrigger className="bg-transparent border-none focus:outline-none text-sm px-2 min-h-0 h-auto">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {indianLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </form>
  );
};

export default SearchBar;
