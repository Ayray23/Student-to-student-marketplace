// /src/app/dashboard/page.jsx
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
import { createClient } from "@/utils/supabase/client";

import Navbar from "/src/components/navbar.tsx";

const categories = ["All", "Books", "Fashion", "Electronics", "Furniture", "Others"];

export default function Dashboard() {
  const supabase = createClient();

  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [loading, setLoading] = useState(true);

  // infinite scroll
  const [visibleCount, setVisibleCount] = useState(12);
  const loaderRef = useRef(null);

  // fetch products once
  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_sold", false)
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (error) {
        console.error("Fetch products error:", error);
        setError("Failed to load products.");
      } else {
        setProducts(data || []);
        setError("");
      }
      setLoading(false);
    };
    fetchProducts();
    return () => { mounted = false; };
  }, [supabase]);

  // toggle favorite (local only)
  const toggleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // filtering logic
  let filteredProducts = products;

  if (showFavorites) {
    filteredProducts = products.filter((p) => favorites.includes(p.id));
  } else if (selectedCategory && selectedCategory !== "All") {
    filteredProducts = products.filter(
      (p) => (p.category || "").toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        ((p.title || p.name || "").toLowerCase().includes(q)) ||
        ((p.description || "").toLowerCase().includes(q)) ||
        ((p.category || "").toLowerCase().includes(q))
    );
  }

  // featured
  const featured = products.filter((p) => !p.is_sold).slice(0, 6);
  const slides = Math.max(1, featured.length);

  // carousel controls
  const nextSlide = () => setCurrentSlide((s) => (s + 1) % slides);
  const prevSlide = () => setCurrentSlide((s) => (s - 1 + slides) % slides);

  useEffect(() => {
    if (slides > 1) {
      const t = setInterval(() => setCurrentSlide((s) => (s + 1) % slides), 4000);
      return () => clearInterval(t);
    }
  }, [slides]);

  // infinite scroll observer
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (target && target.isIntersecting && visibleCount < filteredProducts.length) {
        setVisibleCount((v) => v + 8);
      }
    },
    [visibleCount, filteredProducts.length]
  );

  useEffect(() => {
    const option = { root: null, rootMargin: "200px", threshold: 0.2 };
    const observer = new IntersectionObserver(handleObserver, option);
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [handleObserver]);

  // search handler (keeps existing query logic but triggers UI)
  const handleSearch = (e) => {
    e?.preventDefault();
    setShowFavorites(false);
    if (!query.trim()) {
      setError("Type something to search");
      return;
    }
    setError("");
    // filteredProducts will reactively update via state `query`
    // reset visibleCount when performing search
    setVisibleCount(12);
    // optionally scroll to product list
    const el = document.getElementById("product-list");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar
          setSelectedCategory={(c) => { setSelectedCategory(c); setShowFavorites(false); setQuery(""); }}
          setQuery={setQuery}
          setShowFavorites={(v) => { setShowFavorites(v); }}
          showFavorites={showFavorites}
          favorites={favorites}
        />
      </div>

      {/* Sticky search bar just below navbar */}
      <div className="sticky top-16 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-2 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="pl-3 pr-2 flex items-center">
                <Search className="text-gray-500" size={18} />
              </div>
              <input
                aria-label="Search products"
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Search products, categories or descriptions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <button
              type="submit"
              onClick={handleSearch}
              className="whitespace-nowrap px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium"
            >
              Search
            </button>
          </form>

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      </div>

      {/* Hero */}
      <div className="relative  bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 pb-10 pt-6 sm:pt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
            Connect with fellow students — buy & sell on campus.
          </h2>
          <p className="text-sm sm:text-base text-white/90 mb-20">
            Carefully curated student marketplace — safe and simple.
          </p>
        </div>

        {/* curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path className="fill-gray-50 dark:fill-gray-900"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L0,120Z" />
          </svg>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-7xl mx-auto px-4 mt-8 mb-12 grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Categories sidebar */}
        <aside className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <button
            className="w-full flex justify-between items-center md:hidden px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold"
            onClick={() => setShowCategories((s) => !s)}
          >
            Categories {showCategories ? <ChevronUp /> : <ChevronDown />}
          </button>

          <ul className={`mt-4 ${showCategories ? "block" : "hidden md:block"}`}>
            {categories.map((cat) => (
              <li key={cat} className="mb-2">
                <button
                  onClick={() => { setSelectedCategory(cat); setShowFavorites(false); setQuery(""); }}
                  className={`w-full text-left px-3 py-2 rounded-md flex justify-between items-center ${
                    selectedCategory === cat ? "bg-pink-50 text-pink-600 font-semibold" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="capitalize">{cat}</span>
                  <ChevronRight size={14} />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main content (products + carousel) */}
        <main id="product-list" className="md:col-span-4">
          {/* Featured carousel */}
         {/* Featured carousel - clicking goes to /product/:id */}
          {featured.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">🔥 Featured</h3>
                <div className="flex items-center gap-2">
                  <button onClick={prevSlide} className="p-2 rounded-md bg-white dark:bg-gray-700 shadow">‹</button>
                  <button onClick={nextSlide} className="p-2 rounded-md bg-white dark:bg-gray-700 shadow">›</button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {featured.map((p, i) => (
                    <Link
                      key={i}
                      href={`/product/${p.id ?? p._id ?? ''}`}
                      className="flex-shrink-0 w-full px-4 py-6 cursor-pointer"
                      aria-label={`View ${p.title || p.name || 'product'}`}
                    >
                      <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="w-full md:w-1/2 flex justify-center items-center">
                          <img
                            src={Array.isArray(p.images) ? p.images[0] : p.image}
                            alt={p.title || p.name || 'product image'}
                            className="max-h-[320px] object-contain"
                          />
                        </div>
                        <div className="md:w-1/2">
                          <h4 className="text-lg font-semibold">{p.title || p.name}</h4>
                          <p className="text-pink-600 font-bold mt-2">₦{p.price}</p>
                          {/* {p.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{p.description}</p>
                          )} */}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-3">
                {Array.from({ length: slides }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-3 h-3 rounded-full ${currentSlide === i ? "bg-pink-600" : "bg-gray-300 dark:bg-gray-600"}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}


          {/* Products header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              {showFavorites ? "❤️ Favorites" : query ? `🔍 Results for "${query}"` : selectedCategory === "All" ? "🛒 All Products" : `${selectedCategory} Products`}
            </h3>
            <div className="text-sm text-gray-500">{filteredProducts.length} results</div>
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-52" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.slice(0, visibleCount).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={favorites.includes(product.id)}
                    toggleFavorite={toggleFavorite}
                  />
                ))}
              </div>

              {/* <div ref={loaderRef} className="mt-6 flex justify-center items-center">
                {visibleCount < filteredProducts.length ? (
                  <p className="text-gray-600 dark:text-gray-300">Loading more...</p>
                  ) : (
                  <p className="text-gray-500 dark:text-gray-400">End of results</p>
                 )
              }
              </div> */}
            </>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No products found.</p>
          )}
        </main>
      </div>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ServiceCard icon={<Truck className="text-pink-600 w-8 h-8" />} title="Fast Delivery" description="Get your items delivered quickly and safely within campus." />
        <ServiceCard icon={<Shield className="text-pink-600 w-8 h-8" />} title="Secure Payment" description="Your transactions are safe with our trusted payment system." />
        <ServiceCard icon={<Package className="text-pink-600 w-8 h-8" />} title="Quality Products" description="Buy and sell only the best items verified by students." />
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h4 className="font-bold mb-2">CampusMart</h4>
            <p className="text-gray-400 text-sm">A marketplace built for students, by students.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Quick Links</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/add-product">Sell Product</Link></li>
              <li><Link href="/favorites">Favorites</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2">Support</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li><Link href="#">Help Center</Link></li>
              <li><Link href="#">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2">Follow</h4>
            <div className="flex gap-3">
              <Facebook className="w-6 h-6 text-gray-400" />
              <Twitter className="w-6 h-6 text-gray-400" />
              <Instagram className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-6 text-xs">© {new Date().getFullYear()} CampusMart</div>
      </footer>
    </section>
  );
}

/* ProductCard component */
function ProductCard({ product, isFavorite, toggleFavorite }) {
  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transform hover:-translate-y-1 transition overflow-hidden h-full flex flex-col">
        <div className="relative">
          <div className="aspect-w-1 aspect-h-1">
            <img
              src={Array.isArray(product.images) ? product.images[0] : product.image}
              alt={product.title || product.name}
              className="w-full h-48 object-contain bg-gray-50 dark:bg-gray-700 p-3"
            />
          </div>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id); }}
            className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-gray-700 rounded-full shadow"
            aria-label="favorite"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "text-red-500" : "text-gray-600"}`} />
          </button>
        </div>

        <div className="p-3 flex-1 flex flex-col">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-sm line-clamp-2">{product.title || product.name}</h4>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-pink-600 font-bold">₦{product.price}</p>
              <p className="text-xs text-gray-500 mt-1">{product.category}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* Service card */
function ServiceCard({ icon, title, description }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <h5 className="font-semibold mb-2">{title}</h5>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
