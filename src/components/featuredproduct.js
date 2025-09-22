"use client";
import { useState, useEffect } from "react";

export default function FeaturedCarousel({ products, favorites, toggleFavorite }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Only first 6 products as featured
  const featured = products.slice(0, 6);
  const slides = Math.ceil(featured.length / 3);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides) % slides);

  // Autoplay every 4s
  useEffect(() => {
    if (slides > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [slides]);

  if (!featured.length) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
          🔥 Featured Products
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-white dark:bg-gray-700 shadow hover:shadow-md transition"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-white dark:bg-gray-700 shadow hover:shadow-md transition"
          >
            ›
          </button>
        </div>
      </div>

      {/* Carousel wrapper */}
      <div className="overflow-hidden relative">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({ length: slides }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full flex-shrink-0"
              style={{ flex: "0 0 100%" }}
            >
              {featured
                .slice(i * 3, i * 3 + 3)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={favorites.includes(product.id)}
                    toggleFavorite={toggleFavorite}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: slides }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-3 h-3 rounded-full ${
              currentSlide === i
                ? "bg-pink-600"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
