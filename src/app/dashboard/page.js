"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Search,
  Heart,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Truck,
  Shield,
  Package,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "/src/utils/supabase/client.ts";
import Navbar from "/src/components/navbar.tsx";

const categories = ["All", "Books", "Fashion", "Electronics", "Furniture", "Others"];

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [loading, setLoading] = useState(true);

  // Infinite scroll states
  const [visibleCount, setVisibleCount] = useState(12);
  const loaderRef = useRef(null);

  const supabase = createClient();

  
  // ✅ Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_sold", false); // 🔥 Only fetch unsold products

      if (error) {
        console.error(error);
        setError("Failed to load products.");
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);


  // ✅ Add/remove favorites
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  // ✅ Filtering logic
  let filteredProducts = products;

  if (showFavorites) {
    filteredProducts = products.filter((p) => favorites.includes(p.id));
  } else if (selectedCategory !== "All") {
    filteredProducts = products.filter(
      (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  if (query.trim()) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.toLowerCase().includes(query.toLowerCase())
    );
  }

  
  // ✅ Featured products (only unsold)
  const featured = products.filter((p) => p.is_sold === false).slice(0, 6);
  const slides = featured.length;

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

  // ✅ Infinite scroll observer
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && visibleCount < filteredProducts.length) {
        setVisibleCount((prev) => prev + 8); // Load 8 more
      }
    },
    [visibleCount, filteredProducts.length]
  );

  useEffect(() => {
    const option = { root: null, rootMargin: "20px", threshold: 0.2 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [handleObserver]);

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar (sticky) */}
      <div className="sticky top-0 z-50">
        <Navbar
          setSelectedCategory={setSelectedCategory}
          setQuery={setQuery}
          setShowFavorites={setShowFavorites}
          showFavorites={showFavorites}
          favorites={favorites}
        />
      </div>

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 pb-20 pt-12 sm:pt-16 overflow-hidden">
        <div className="text-center text-white relative z-10 px-4">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 animate-pulse">
            What are you looking to buy or sell? 🎓
          </h2>
          <p className="text-base sm:text-lg mb-6 text-white/90">
            Connect with fellow students for amazing deals!
          </p>
          <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center bg-white rounded-full shadow-lg overflow-hidden">
            <div className="flex items-center w-full">
              <Search className="ml-4 text-gray-400 shrink-0" size={20} />
              <input
                type="text"
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-4 py-3 outline-none text-gray-700 text-sm sm:text-base"
              />
            </div>
            <button
              onClick={() => {
                if (!query.trim()) setError("Type something to search");
                else setError("");
                setShowFavorites(false);
              }}
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium hover:from-pink-700 hover:to-purple-700 transition"
            >
              Search
            </button>
          </div>
        </div>
        {/* Curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path
              className="fill-gray-50 dark:fill-gray-900"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L0,120Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto mt-10 px-4 gap-6">
        {/* Sidebar / Categories */}
        <aside className="w-full md:w-1/5 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit">
          <button
            className="w-full flex justify-between items-center md:hidden px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold"
            onClick={() => setShowCategories(!showCategories)}
          >
            Categories {showCategories ? <ChevronUp /> : <ChevronDown />}
          </button>
          <ul
            className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2 mt-4 md:mt-0 ${
              showCategories ? "block" : "hidden md:block"
            }`}
          >
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowFavorites(false);
                    setQuery("");
                    if (window.innerWidth < 768) setShowCategories(false);
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm sm:text-base ${
                    selectedCategory === cat
                      ? "bg-pink-100 text-pink-600 font-semibold"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat} <ChevronRight size={14} />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Featured Carousel */}
          {featured.length > 0 && (
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
              <div className="overflow-hidden relative h-[40vh] md:h-[50] lg:h-[60vh]">
                <div
                  className="flex transition-transform duration-500 ease-in-out h-full"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {featured.map((product, i) => (
                    <div
                      key={i}
                      className="w-full flex-shrink-0 px-4 h-full"
                      style={{ flex: "0 0 100%" }}
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow h-full flex flex-col">
                        {/* Image fills most of the height */}
                        <div className="flex-1 overflow-hidden rounded-t-xl">
                          <img
                            src={Array.isArray(product.images) ? product.images[0] : product.image}
                            alt={product.name || product.title}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Card body */}
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 text-sm">
                            {product.name || product.title}
                          </h3>
                          <p className="text-pink-600 font-bold text-base">₦{product.price}</p>
                        </div>
                      </div>
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
                      currentSlide === i ? "bg-pink-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Products */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              {showFavorites
                ? "❤️ Your Favorites"
                : query
                ? "🔍 Search Results"
                : selectedCategory === "All"
                ? "🛒 All Products"
                : `${selectedCategory} Products`}
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48"
                  />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {filteredProducts.slice(0, visibleCount).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorite={favorites.includes(product.id)}
                      toggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
                <div ref={loaderRef} className="h-12 flex justify-center items-center">
                  {visibleCount < filteredProducts.length && (
                    <p className="text-gray-500 dark:text-gray-300 text-sm">
                      Loading more...
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="col-span-full text-gray-500 dark:text-gray-300">
                {error || "No products found."}
              </p>
            )}
          </div>
        </main>
      </div>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <ServiceCard
          icon={<Truck className="text-pink-600 w-8 h-8" />}
          title="Fast Delivery"
          description="Get your items delivered quickly and safely within campus."
        />
        <ServiceCard
          icon={<Shield className="text-pink-600 w-8 h-8" />}
          title="Secure Payment"
          description="Your transactions are safe with our trusted payment system."
        />
        <ServiceCard
          icon={<Package className="text-pink-600 w-8 h-8" />}
          title="Quality Products"
          description="Buy and sell only the best items verified by students."
        />
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">CampusMart</h3>
            <p className="text-gray-400 text-sm">
              A marketplace built for students, by students. Buy and sell with ease within your campus.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/add-product">Sell Product</Link></li>
              <li><Link href="/favorites">Favorites</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="#">Help Center</Link></li>
              <li><Link href="#">Contact Us</Link></li>
              <li><Link href="#">Report Issue</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Facebook className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
              <Instagram className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 text-xs mt-8">
          © {new Date().getFullYear()} CampusMart. All rights reserved. Rayechos
        </div>
      </footer>
    </section>
  );
}

function ProductCard({ product, isFavorite, toggleFavorite, badge }) {
  return (
    <Link href={`/product/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition cursor-pointer">
        <div className="relative">
          <div className="aspect-square overflow-hidden">
            <img
              src={Array.isArray(product.images) ? product.images[0] : product.image}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          {badge && (
            <span className="absolute top-2 left-2 bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(product.id);
            }}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition"
          >
            <Heart
              className={`w-4 h-4 ${isFavorite ? "text-red-500" : "text-gray-600"}`}
            />
          </button>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 line-clamp-1 text-sm sm:text-base">
            {product.title}
          </h3>
          <p className="text-lg sm:text-xl font-bold text-pink-600 mt-1">₦{product.price}</p>
          <p className="text-xs text-gray-500 mt-1">{product.category}</p>
        </div>
      </div>
    </Link>
  );
}

function ServiceCard({ icon, title, description }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-lg hover:scale-105 transition">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
