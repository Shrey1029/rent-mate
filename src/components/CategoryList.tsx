
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";

const CategoryList = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = containerRef.current?.querySelectorAll(".category-item");
            elements?.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add("animate-slide-in");
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
    <section className="section-padding bg-white">
      <div className="rentmate-container">
        <div className="text-center mb-12">
          <h2 className="section-title mb-4">Browse by Category</h2>
          <p className="body-text max-w-2xl mx-auto">
            Discover the perfect rental items across our most popular categories
          </p>
        </div>

        <div
          ref={containerRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6"
        >
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/browse?category=${category.id}`}
              className={cn(
                "category-item opacity-0 flex flex-col items-center justify-center p-6 rounded-2xl glass animated-card",
                index === 0 ? "bg-rentmate-gold/10" : "",
                index === 1 ? "bg-rentmate-orange/10" : "",
                index === 2 ? "bg-rentmate-pink/10" : "",
                index === 3 ? "bg-rentmate-lightBlue/10" : "",
                index >= 4 ? "bg-muted" : ""
              )}
            >
              <div className="text-4xl mb-3">{category.icon}</div>
              <h3 className="font-medium text-base mb-1">{category.name}</h3>
              <p className="text-xs text-muted-foreground text-center">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryList;
