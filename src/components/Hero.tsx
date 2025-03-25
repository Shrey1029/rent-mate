
import React, { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Animation sequence for elements
  useEffect(() => {
    const headingElement = document.getElementById("hero-heading");
    const subheadingElement = document.getElementById("hero-subheading");
    const searchElement = document.getElementById("hero-search");
    const statElement = document.getElementById("hero-stats");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (headingElement) {
      observer.observe(headingElement);
      headingElement.style.opacity = "0";
    }
    if (subheadingElement) {
      observer.observe(subheadingElement);
      subheadingElement.style.opacity = "0";
      subheadingElement.style.animationDelay = "100ms";
    }
    if (searchElement) {
      observer.observe(searchElement);
      searchElement.style.opacity = "0";
      searchElement.style.animationDelay = "200ms";
    }
    if (statElement) {
      observer.observe(statElement);
      statElement.style.opacity = "0";
      statElement.style.animationDelay = "300ms";
    }

    return () => {
      if (headingElement) observer.unobserve(headingElement);
      if (subheadingElement) observer.unobserve(subheadingElement);
      if (searchElement) observer.unobserve(searchElement);
      if (statElement) observer.unobserve(statElement);
    };
  }, []);

  const handleSearchFocus = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <section className="pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden relative">
      <div className="rentmate-container">
        <div className="max-w-3xl mx-auto text-center">
          <h1
            id="hero-heading"
            className="display-title text-primary mb-6"
          >
            <span className="block">Rent Anything, Anywhere</span>
            <span className="text-rentmate-orange">Without Compromise</span>
          </h1>
          
          <p
            id="hero-subheading"
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Access thousands of items without the cost of ownership. Find exactly what you need, when you need it, from people in your community.
          </p>
          
          <div
            id="hero-search"
            className="glass rounded-full flex items-center overflow-hidden p-1 pl-6 mx-auto max-w-2xl shadow-lg mb-8"
            onClick={handleSearchFocus}
          >
            <Search className="h-5 w-5 text-muted-foreground mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="What do you want to rent today?"
              className="flex-1 bg-transparent border-none focus:outline-none py-3 px-1 text-foreground"
            />
            <Link to="/browse" className="button-primary py-3 px-6 rounded-full bg-rentmate-orange text-white">
              Search
            </Link>
          </div>
          
          <div
            id="hero-stats"
            className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mt-12"
          >
            <div className="glass py-4 px-2 rounded-xl animated-card">
              <h3 className="font-bold text-3xl text-rentmate-orange">10K+</h3>
              <p className="text-muted-foreground text-sm">Active Rentals</p>
            </div>
            <div className="glass py-4 px-2 rounded-xl animated-card">
              <h3 className="font-bold text-3xl text-rentmate-orange">5K+</h3>
              <p className="text-muted-foreground text-sm">Happy Users</p>
            </div>
            <div className="glass py-4 px-2 rounded-xl col-span-2 md:col-span-1 animated-card">
              <h3 className="font-bold text-3xl text-rentmate-orange">24/7</h3>
              <p className="text-muted-foreground text-sm">Support</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-rentmate-gold/10 rounded-full blur-3xl opacity-70"></div>
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-rentmate-orange/10 rounded-full blur-3xl opacity-60"></div>
    </section>
  );
};

export default Hero;
