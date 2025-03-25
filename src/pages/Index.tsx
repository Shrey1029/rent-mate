
import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CategoryList from "@/components/CategoryList";
import FeaturedItems from "@/components/FeaturedItems";
import Footer from "@/components/Footer";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Browse & Search",
      description: "Search for items by category, location, or keywords to find exactly what you need."
    },
    {
      number: "02",
      title: "Rent with Confidence",
      description: "Book items with secure payments, verified owners, and clear rental terms."
    },
    {
      number: "03",
      title: "Enjoy Your Rental",
      description: "Pick up your item and use it for your specified rental period."
    },
    {
      number: "04",
      title: "Return & Review",
      description: "Return the item in the same condition and leave a review for the owner."
    }
  ];

  return (
    <section className="section-padding">
      <div className="rentmate-container">
        <div className="text-center mb-12">
          <h2 className="section-title mb-4">How RentMate Works</h2>
          <p className="body-text max-w-2xl mx-auto">
            Renting has never been easier. Follow these simple steps to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="glass p-6 rounded-2xl relative animated-card"
            >
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-rentmate-orange flex items-center justify-center text-white font-bold">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-3 mt-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CtaSection = () => {
  return (
    <section className="bg-rentmate-charcoal text-white py-20">
      <div className="rentmate-container">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="mb-8 lg:mb-0 lg:max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to start renting?
            </h2>
            <p className="text-white/80 mb-6 text-lg">
              Join thousands of people who are already saving money and reducing waste by renting instead of buying.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/auth" className="button-primary bg-rentmate-gold text-black">
                Get Started
              </a>
              <a href="/browse" className="button-secondary bg-transparent border border-white text-white">
                Browse Items
              </a>
            </div>
          </div>
          <div className="lg:w-1/3 relative">
            <div className="absolute inset-0 bg-rentmate-orange/20 rounded-full blur-3xl"></div>
            <div className="relative glass-dark rounded-2xl p-8 backdrop-blur-lg border border-white/10">
              <div className="text-4xl font-bold mb-4">96%</div>
              <p className="text-white/80 mb-3">of items are used less than once a month</p>
              <div className="w-16 h-1 bg-rentmate-gold"></div>
              <div className="mt-6">
                <div className="text-4xl font-bold mb-4">$700+</div>
                <p className="text-white/80">average annual savings for renters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-transition min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <CategoryList />
        <FeaturedItems />
        <HowItWorks />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
