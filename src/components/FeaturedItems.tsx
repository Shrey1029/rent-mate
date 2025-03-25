
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ItemCard from "./ItemCard";
import { getFeaturedItems } from "@/lib/data";

const FeaturedItems = () => {
  const featuredItems = getFeaturedItems();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = containerRef.current?.querySelectorAll(".item-card");
            elements?.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add("animate-fade-in");
              }, index * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <section className="section-padding bg-rentmate-offWhite">
      <div className="rentmate-container">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="section-title mb-2">Featured Items</h2>
            <p className="body-text max-w-2xl">
              Discover our most popular and high-quality rental options
            </p>
          </div>
          <Link
            to="/browse"
            className="hidden md:flex items-center text-sm font-medium hover:text-accent transition-colors"
          >
            View all
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div
          ref={containerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {featuredItems.map((item, index) => (
            <div className="item-card opacity-0" key={item.id}>
              <ItemCard item={item} featured={true} />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/browse"
            className="inline-flex items-center text-sm font-medium hover:text-accent transition-colors"
          >
            View all items
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedItems;
