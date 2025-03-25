
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300 ease-in-out",
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="rentmate-container">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 text-2xl font-bold"
          >
            <span className="text-rentmate-orange">Rent</span>
            <span className="text-primary">Mate</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              <Link
                to="/"
                className="text-sm font-medium hover:text-accent transition-colors animated-hover"
              >
                Home
              </Link>
              <Link
                to="/browse"
                className="text-sm font-medium hover:text-accent transition-colors animated-hover"
              >
                Browse
              </Link>
              <Link
                to="/how-it-works"
                className="text-sm font-medium hover:text-accent transition-colors animated-hover"
              >
                How It Works
              </Link>
              <Link
                to="/dashboard"
                className="text-sm font-medium hover:text-accent transition-colors animated-hover"
              >
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="rounded-full p-2 hover:bg-muted transition-colors animated-hover">
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/auth"
              className="button-primary bg-rentmate-gold text-black py-2 px-6"
            >
              Sign In
            </Link>
          </div>

          <button
            className="p-2 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-16 animate-fade-in md:hidden">
          <div className="rentmate-container py-6 flex flex-col space-y-6">
            <Link
              to="/"
              className="text-lg font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/browse"
              className="text-lg font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse
            </Link>
            <Link
              to="/how-it-works"
              className="text-lg font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="/dashboard"
              className="text-lg font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <div className="pt-4 border-t">
              <Link
                to="/auth"
                className="button-primary bg-rentmate-gold text-black w-full flex justify-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
