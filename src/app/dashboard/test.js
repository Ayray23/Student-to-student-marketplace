





// // // "use client";

// // // import { useEffect, useState } from "react";
// // // import {
// // //   Star,
// // //   Search,
// // //   Heart,
// // //   ChevronRight,
// // //   Truck,
// // //   Shield,
// // //   Package,
// // //   ShoppingBag,
// // //   Facebook,
// // //   Twitter,
// // //   Instagram,
// // // } from "lucide-react";
// // // import Link from "next/link";
// // // import { createClient } from "/src/utils/supabase/client.ts";
// // // import Navbar from "/src/components/navbar.tsx";
// // // import Navbar from "/src/components/navbar.tsx";

// // // const categories = ["All", "Books", "Fashion", "Gadgets", "Furniture", "Others"];

// // // export default function HomePage() {
// // //   const [products, setProducts] = useState<any[]>([]);
// // //   const [favorites, setFavorites] = useState<number[]>([]);
// // //   const [currentSlide, setCurrentSlide] = useState(0);
// // //   const [selectedCategory, setSelectedCategory] = useState("All");
// // //   const [query, setQuery] = useState("");
// // //   const [error, setError] = useState("");
// // //   const [showFavorites, setShowFavorites] = useState(false);

// // //   const supabase = createClient();

// // //   // ✅ fetch products
// // //   useEffect(() => {
// // //     const fetchProducts = async () => {
// // //       const { data, error } = await supabase.from("products").select("*");
// // //       if (error) {
// // //         console.error(error);
// // //         setError("Failed to load products.");
// // //       } else {
// // //         setProducts(data || []);
// // //       }
// // //     };
// // //     fetchProducts();
// // //   }, []);

// // //   // ✅ Add/remove favorites
// // //   const toggleFavorite = (id) => {
// // //     setFavorites((prev) =>
// // //       prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
// // //     );
// // //   };

// // //   // ✅ Filtering logic
// // //   let filteredProducts = products;

// // //   if (showFavorites) {
// // //     filteredProducts = products.filter((p) => favorites.includes(p.id));
// // //   } else if (selectedCategory !== "All") {
// // //     filteredProducts = products.filter((p) =>
// // //       p.category?.toLowerCase() === selectedCategory.toLowerCase()
// // //     );
// // //   }

// // //   if (query.trim()) {
// // //     filteredProducts = filteredProducts.filter(
// // //       (p) =>
// // //         p.name?.toLowerCase().includes(query.toLowerCase()) ||
// // //         p.category?.toLowerCase().includes(query.toLowerCase())
// // //     );
// // //   }

// // //   const slides = Math.ceil(products.slice(0, 6).length / 3);
// // //   const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides);
// // //   const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides) % slides);

// // //   return (
// // //     <section className="min-h-screen bg-gray-50 dark:bg-gray-900">
// // //       {/* Navbar */}
// // //       <Navbar
// // //         setSelectedCategory={setSelectedCategory}
// // //         setQuery={setQuery}
// // //         setShowFavorites={setShowFavorites}
// // //         showFavorites={showFavorites}
// // //         favorites={favorites}
// // //       />

// // //       {/* Hero */}
// // //       <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 pb-20 pt-12 sm:pt-16 overflow-hidden">
// // //         <div className="text-center text-white relative z-10 px-4">
// // //           <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 animate-pulse">
// // //             What are you looking to buy or sell? 🎓
// // //           </h2>
// // //           <p className="text-base sm:text-lg mb-6 text-white/90">
// // //             Connect with fellow students for amazing deals!
// // //           </p>
// // //           <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center bg-white rounded-full shadow-lg overflow-hidden">
// // //             <div className="flex items-center w-full">
// // //               <Search className="ml-4 text-gray-400 shrink-0" size={20} />
// // //               <input
// // //                 type="text"
// // //                 placeholder="Search for products..."
// // //                 value={query}
// // //                 onChange={(e) => setQuery(e.target.value)}
// // //                 className="flex-1 px-4 py-3 outline-none text-gray-700 text-sm sm:text-base"
// // //               />
// // //             </div>
// // //             <button
// // //               onClick={() => {
// // //                 if (!query.trim()) setError("Type something to search");
// // //                 else setError("");
// // //                 setShowFavorites(false);
// // //               }}
// // //               className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium hover:from-pink-700 hover:to-purple-700 transition"
// // //             >
// // //               Search
// // //             </button>
// // //           </div>
// // //         </div>
// // //         {/* Curve */}
// // //         <div className="absolute bottom-0 left-0 right-0">
// // //           <svg
// // //             xmlns="http://www.w3.org/2000/svg"
// // //             viewBox="0 0 1440 120"
// // //             className="w-full"
// // //           >
// // //             <path
// // //               fill="#f9fafb"
// // //               fillOpacity="1"
// // //               d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L0,120Z"
// // //             ></path>
// // //           </svg>
// // //         </div>
// // //       </div>

// // //       {/* Layout */}
// // //       <div className="flex flex-col md:flex-row max-w-7xl mx-auto mt-10 px-4 gap-6">
// // //         {/* Sidebar */}
// // //         <aside className="w-full md:w-1/5 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit sticky top-24">
// // //           <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">
// // //             Categories
// // //           </h3>
// // //           <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2">
// // //             {categories.map((cat) => (
// // //               <li key={cat}>
// // //                 <button
// // //                   onClick={() => {
// // //                     setSelectedCategory(cat);
// // //                     setShowFavorites(false);
// // //                     setQuery("");
// // //                   }}
// // //                   className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm sm:text-base ${
// // //                     selectedCategory === cat
// // //                       ? "bg-pink-100 text-pink-600 font-semibold"
// // //                       : "hover:bg-gray-100 dark:hover:bg-gray-700"
// // //                   }`}
// // //                 >
// // //                   {cat} <ChevronRight size={14} />
// // //                 </button>
// // //               </li>
// // //             ))}
// // //           </ul>
// // //         </aside>

// // //         {/* Main */}
// // //         <main className="flex-1">
// // //           {/* Featured */}
// // //           {!showFavorites && selectedCategory === "All" && !query && (
// // //             <div className="mb-10">
// // //               <div className="flex items-center justify-between mb-6">
// // //                 <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
// // //                   🔥 Featured Products
// // //                 </h2>
// // //                 <div className="flex gap-2">
// // //                   <button
// // //                     onClick={prevSlide}
// // //                     className="p-2 rounded-full bg-white shadow hover:shadow-md transition"
// // //                   >
// // //                     ‹
// // //                   </button>
// // //                   <button
// // //                     onClick={nextSlide}
// // //                     className="p-2 rounded-full bg-white shadow hover:shadow-md transition"
// // //                   >
// // //                     ›
// // //                   </button>
// // //                 </div>
// // //               </div>

// // //               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
// // //                 {products
// // //                   .slice(currentSlide * 3, currentSlide * 3 + 3)
// // //                   .map((product) => (
// // //                     <ProductCard
// // //                       key={product.id}
// // //                       product={product}
// // //                       isFavorite={favorites.includes(product.id)}
// // //                       toggleFavorite={toggleFavorite}
// // //                     />
// // //                   ))}
// // //               </div>
// // //             </div>
// // //           )}

// // //           {/* All Products */}
// // //           <div>
// // //             <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 dark:text-white">
// // //               {showFavorites
// // //                 ? "❤️ Your Favorites"
// // //                 : query
// // //                 ? "🔍 Search Results"
// // //                 : selectedCategory === "All"
// // //                 ? "🛒 All Products"
// // //                 : `${selectedCategory} Products`}
// // //             </h2>
// // //             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
// // //               {filteredProducts.length > 0 ? (
// // //                 filteredProducts.map((product) => (
// // //                   <ProductCard
// // //                     key={product.id}
// // //                     product={product}
// // //                     isFavorite={favorites.includes(product.id)}
// // //                     toggleFavorite={toggleFavorite}
// // //                   />
// // //                 ))
// // //               ) : (
// // //                 <p className="col-span-full text-gray-500 dark:text-gray-300">
// // //                   {error || "No products found."}
// // //                 </p>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </main>
// // //       </div>
// // //     </section>
// // //   );
// // // }

// // // function ProductCard({ product, isFavorite, toggleFavorite }: any) {
// // //   return (
// // //     <Link href={`/product/${product.id}`}>
// // //       <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition cursor-pointer">
// // //         <div className="relative">
// // //           <img
// // //             src={product.images}
// // //             alt={product.title}
// // //             className="h-36 sm:h-40 w-full object-cover"
// // //           />
// // //           <button
// // //             onClick={(e) => {
// // //               e.preventDefault();
// // //               toggleFavorite(product.id);
// // //             }}
// // //             className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition"
// // //           >
// // //             <Heart
// // //               className={`w-4 h-4 ${
// // //                 isFavorite ? "text-red-500" : "text-gray-600"
// // //               }`}
// // //             />
// // //           </button>
// // //         </div>
// // //         <div className="p-3">
// // //           <h3 className="font-semibold text-gray-800 line-clamp-1 text-sm sm:text-base">
// // //             {product.name}
// // //           </h3>
// // //           <p className="text-lg sm:text-xl font-bold text-pink-600 mt-1">
// // //             ₦{product.price}
// // //           </p>
// // //           <p className="text-xs text-gray-500 mt-1">{product.category}</p>
// // //         </div>
// // //       </div>
// // //     </Link>
// // //   );
// // // }



// // // "use client";

// // // import { useEffect, useState } from "react";
// // // import {
// // //   Star,
// // //   Search,
// // //   Heart,
// // //   ChevronRight,
// // //   ChevronDown,
// // //   ChevronUp,
// // //   Truck,
// // //   Shield,
// // //   Package,
// // //   Facebook,
// // //   Twitter,
// // //   Instagram,
// // // } from "lucide-react";
// // // import Link from "next/link";
// // // import { createClient } from "/src/utils/supabase/client.ts";
// // // import Navbar from "/src/components/navbar.tsx";

// // // const categories = ["All", "Books", "Fashion", "Gadgets", "Furniture", "Others"];

// // // export default function Dashboard() {
// // //   const [products, setProducts] = useState([]);
// // //   const [favorites, setFavorites] = useState([]);
// // //   const [currentSlide, setCurrentSlide] = useState(0);
// // //   const [selectedCategory, setSelectedCategory] = useState("All");
// // //   const [query, setQuery] = useState("");
// // //   const [error, setError] = useState("");
// // //   const [showFavorites, setShowFavorites] = useState(false);
// // //   const [showCategories, setShowCategories] = useState(false); // 👈 toggle for mobile

// // //   const supabase = createClient();

// // //   // ✅ fetch products
// // //   useEffect(() => {
// // //     const fetchProducts = async () => {
// // //       const { data, error } = await supabase.from("products").select("*");
// // //       if (error) {
// // //         console.error(error);
// // //         setError("Failed to load products.");
// // //       } else {
// // //         setProducts(data || []);
// // //       }
// // //     };
// // //     fetchProducts();
// // //   }, []);

// // //   // ✅ Add/remove favorites
// // //   const toggleFavorite = (id) => {
// // //     setFavorites((prev) =>
// // //       prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
// // //     );
// // //   };

// // //   // ✅ Filtering logic
// // //   let filteredProducts = products;

// // //   if (showFavorites) {
// // //     filteredProducts = products.filter((p) => favorites.includes(p.id));
// // //   } else if (selectedCategory !== "All") {
// // //     filteredProducts = products.filter(
// // //       (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
// // //     );
// // //   }

// // //   if (query.trim()) {
// // //     filteredProducts = filteredProducts.filter(
// // //       (p) =>
// // //         p.name?.toLowerCase().includes(query.toLowerCase()) ||
// // //         p.category?.toLowerCase().includes(query.toLowerCase())
// // //     );
// // //   }

// // //   const slides = Math.ceil(products.slice(0, 6).length / 3);
// // //   const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides);
// // //   const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides) % slides);

// // //   return (
// // //     <section className="min-h-screen bg-gray-50 dark:bg-gray-900">
// // //       {/* Navbar */}
// // //       <Navbar
// // //         setSelectedCategory={setSelectedCategory}
// // //         setQuery={setQuery}
// // //         setShowFavorites={setShowFavorites}
// // //         showFavorites={showFavorites}
// // //         favorites={favorites}
// // //       />

// // //       {/* Hero */}
// // //       <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 pb-20 pt-12 sm:pt-16 overflow-hidden">
// // //         <div className="text-center text-white relative z-10 px-4">
// // //           <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 animate-pulse">
// // //             What are you looking to buy or sell? 🎓
// // //           </h2>
// // //           <p className="text-base sm:text-lg mb-6 text-white/90">
// // //             Connect with fellow students for amazing deals!
// // //           </p>
// // //           <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center bg-white rounded-full shadow-lg overflow-hidden">
// // //             <div className="flex items-center w-full">
// // //               <Search className="ml-4 text-gray-400 shrink-0" size={20} />
// // //               <input
// // //                 type="text"
// // //                 placeholder="Search for products..."
// // //                 value={query}
// // //                 onChange={(e) => setQuery(e.target.value)}
// // //                 className="flex-1 px-4 py-3 outline-none text-gray-700 text-sm sm:text-base"
// // //               />
// // //             </div>
// // //             <button
// // //               onClick={() => {
// // //                 if (!query.trim()) setError("Type something to search");
// // //                 else setError("");
// // //                 setShowFavorites(false);
// // //               }}
// // //               className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium hover:from-pink-700 hover:to-purple-700 transition"
// // //             >
// // //               Search
// // //             </button>
// // //           </div>
// // //         </div>
// // //         {/* Curve */}
// // //         <div className="absolute bottom-0 left-0 right-0">
// // //           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
// // //             <path
// // //               fill="#f9fafb"
// // //               d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L0,120Z"
// // //             ></path>
// // //           </svg>
// // //         </div>
// // //       </div>

// // //       {/* Layout */}
// // //       <div className="flex flex-col md:flex-row max-w-7xl mx-auto mt-10 px-4 gap-6">
// // //         {/* Sidebar / Categories */}
// // //         <aside className="w-full md:w-1/5 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-fit sticky top-24">
// // //           <button
// // //             className="w-full flex justify-between items-center md:hidden px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold"
// // //             onClick={() => setShowCategories(!showCategories)}
// // //           >
// // //             Categories {showCategories ? <ChevronUp /> : <ChevronDown />}
// // //           </button>

// // //           {/* Mobile collapsible */}
// // //           <ul
// // //             className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-2 mt-4 md:mt-0 ${
// // //               showCategories ? "block" : "hidden md:block"
// // //             }`}
// // //           >
// // //             {categories.map((cat) => (
// // //               <li key={cat}>
// // //                 <button
// // //                   onClick={() => {
// // //                     setSelectedCategory(cat);
// // //                     setShowFavorites(false);
// // //                     setQuery("");
// // //                     if (window.innerWidth < 768) setShowCategories(false); // auto close on mobile
// // //                   }}
// // //                   className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm sm:text-base ${
// // //                     selectedCategory === cat
// // //                       ? "bg-pink-100 text-pink-600 font-semibold"
// // //                       : "hover:bg-gray-100 dark:hover:bg-gray-700"
// // //                   }`}
// // //                 >
// // //                   {cat} <ChevronRight size={14} />
// // //                 </button>
// // //               </li>
// // //             ))}
// // //           </ul>
// // //         </aside>

// // //         {/* Main */}
// // //         <main className="flex-1">
// // //           {/* Featured */}
// // //           {!showFavorites && selectedCategory === "All" && !query && (
// // //             <div className="mb-10">
// // //               <div className="flex items-center justify-between mb-6">
// // //                 <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
// // //                   🔥 Featured Products
// // //                 </h2>
// // //                 <div className="flex gap-2">
// // //                   <button
// // //                     onClick={prevSlide}
// // //                     className="p-2 rounded-full bg-white shadow hover:shadow-md transition"
// // //                   >
// // //                     ‹
// // //                   </button>
// // //                   <button
// // //                     onClick={nextSlide}
// // //                     className="p-2 rounded-full bg-white shadow hover:shadow-md transition"
// // //                   >
// // //                     ›
// // //                   </button>
// // //                 </div>
// // //               </div>

// // //               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
// // //                 {products
// // //                   .slice(currentSlide * 3, currentSlide * 3 + 3)
// // //                   .map((product) => (
// // //                     <ProductCard
// // //                       key={product.id}
// // //                       product={product}
// // //                       isFavorite={favorites.includes(product.id)}
// // //                       toggleFavorite={toggleFavorite}
// // //                     />
// // //                   ))}
// // //               </div>
// // //             </div>
// // //           )}

// // //           {/* All Products */}
// // //           <div>
// // //             <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 dark:text-white">
// // //               {showFavorites
// // //                 ? "❤️ Your Favorites"
// // //                 : query
// // //                 ? "🔍 Search Results"
// // //                 : selectedCategory === "All"
// // //                 ? "🛒 All Products"
// // //                 : `${selectedCategory} Products`}
// // //             </h2>
// // //             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
// // //               {filteredProducts.length > 0 ? (
// // //                 filteredProducts.map((product) => (
// // //                   <ProductCard
// // //                     key={product.id}
// // //                     product={product}
// // //                     isFavorite={favorites.includes(product.id)}
// // //                     toggleFavorite={toggleFavorite}
// // //                   />
// // //                 ))
// // //               ) : (
// // //                 <p className="col-span-full text-gray-500 dark:text-gray-300">
// // //                   {error || "No products found."}
// // //                 </p>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </main>
// // //       </div>

// // //       {/* Services */}
// // //       <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
// // //         <ServiceCard
// // //           icon={<Truck className="text-pink-600 w-8 h-8" />}
// // //           title="Fast Delivery"
// // //           description="Get your items delivered quickly and safely within campus."
// // //         />
// // //         <ServiceCard
// // //           icon={<Shield className="text-pink-600 w-8 h-8" />}
// // //           title="Secure Payment"
// // //           description="Your transactions are safe with our trusted payment system."
// // //         />
// // //         <ServiceCard
// // //           icon={<Package className="text-pink-600 w-8 h-8" />}
// // //           title="Quality Products"
// // //           description="Buy and sell only the best items verified by students."
// // //         />
// // //       </section>

// // //       {/* Footer */}
// // //       <footer className="bg-gray-800 text-white py-10 mt-12">
// // //         <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
// // //           <div>
// // //             <h3 className="text-lg font-bold mb-4">CampusMart</h3>
// // //             <p className="text-gray-400 text-sm">
// // //               A marketplace built for students, by students. Buy and sell with
// // //               ease within your campus.
// // //             </p>
// // //           </div>
// // //           <div>
// // //             <h3 className="text-lg font-bold mb-4">Quick Links</h3>
// // //             <ul className="space-y-2 text-gray-400 text-sm">
// // //               <li>
// // //                 <Link href="/">Home</Link>
// // //               </li>
// // //               <li>
// // //                 <Link href="/add-product">Sell Product</Link>
// // //               </li>
// // //               <li>
// // //                 <Link href="/favorites">Favorites</Link>
// // //               </li>
// // //             </ul>
// // //           </div>
// // //           <div>
// // //             <h3 className="text-lg font-bold mb-4">Support</h3>
// // //             <ul className="space-y-2 text-gray-400 text-sm">
// // //               <li>
// // //                 <Link href="#">Help Center</Link>
// // //               </li>
// // //               <li>
// // //                 <Link href="#">Contact Us</Link>
// // //               </li>
// // //               <li>
// // //                 <Link href="#">Report Issue</Link>
// // //               </li>
// // //             </ul>
// // //           </div>
// // //           <div>
// // //             <h3 className="text-lg font-bold mb-4">Follow Us</h3>
// // //             <div className="flex space-x-4">
// // //               <Facebook className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
// // //               <Twitter className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
// // //               <Instagram className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
// // //             </div>
// // //           </div>
// // //         </div>
// // //         <div className="text-center text-gray-500 text-xs mt-8">
// // //           © {new Date().getFullYear()} CampusMart. All rights reserved.
// // //         </div>
// // //       </footer>
// // //     </section>
// // //   );
// // // }

// // // function ProductCard({ product, isFavorite, toggleFavorite }) {
// // //   return (
// // //     <Link href={`/product/${product.id}`}>
// // //       <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition cursor-pointer">
// // //         <div className="relative">
// // //           <img
// // //             src={product.images}
// // //             alt={product.title}
// // //             className="h-36 sm:h-40 w-full object-cover"
// // //           />
// // //           <button
// // //             onClick={(e) => {
// // //               e.preventDefault();
// // //               toggleFavorite(product.id);
// // //             }}
// // //             className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition"
// // //           >
// // //             <Heart
// // //               className={`w-4 h-4 ${
// // //                 isFavorite ? "text-red-500" : "text-gray-600"
// // //               }`}
// // //             />
// // //           </button>
// // //         </div>
// // //         <div className="p-3">
// // //           <h3 className="font-semibold text-gray-800 line-clamp-1 text-sm sm:text-base">
// // //             {product.name}
// // //           </h3>
// // //           <p className="text-lg sm:text-xl font-bold text-pink-600 mt-1">
// // //             ₦{product.price}
// // //           </p>
// // //           <p className="text-xs text-gray-500 mt-1">{product.category}</p>
// // //         </div>
// // //       </div>
// // //     </Link>
// // //   );
// // // }

// // // function ServiceCard({ icon, title, description }) {
// // //   return (
// // //     <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
// // //       <div className="mb-4 flex justify-center">{icon}</div>
// // //       <h4 className="font-bold text-lg text-gray-800 dark:text-white mb-2">
// // //         {title}
// // //       </h4>
// // //       <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
// // //     </div>
// // //   );
// // // }



// // import { useEffect, useState } from "react";
// // import {
// //   Star,
// //   Search,
// //   Heart,
// //   ChevronRight,
// //   ChevronDown,
// //   ChevronUp,
// //   Truck,
// //   Shield,
// //   Package,
// //   Facebook,
// //   Twitter,
// //   Instagram,
// //   ChevronLeft,
// // } from "lucide-react";
// // // "use client";

// // // import { useEffect, useState } from "react";
// // // import {
// // //   Star,
// // //   Search,
// // //   Heart,
// // //   ChevronRight,
// // //   ChevronDown,
// // //   ChevronUp,
// // //   Truck,
// // //   Shield,
// // //   Package,
// // //   Facebook,
// // //   Twitter,
// // //   Instagram,
// // // } from "lucide-react";
// // // import Link from "next/link";
// // // import { createClient } from "/src/utils/supabase/client.ts";
// // // import Navbar from "/src/components/navbar.tsx";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import React from "react";

// // const Dashboard = () => {
// //   const [products] = useState<Product[]>(mockProducts);
// //   const [favorites, setFavorites] = useState<number[]>([]);
// //   const [currentSlide, setCurrentSlide] = useState(0);
// //   const [selectedCategory, setSelectedCategory] = useState("All");
// //   const [query, setQuery] = useState("");
// //   const [error, setError] = useState("");
// //   const [showFavorites, setShowFavorites] = useState(false);
// //   const [showCategories, setShowCategories] = useState(false);

// //   // Add/remove favorites
// //   const toggleFavorite = (id: number) => {
// //     setFavorites((prev) =>
// //       prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
// //     );
// //   };

// //   // Filtering logic
// //   let filteredProducts = products;

// //   if (showFavorites) {
// //     filteredProducts = products.filter((p) => favorites.includes(p.id));
// //   } else if (selectedCategory !== "All") {
// //     filteredProducts = products.filter(
// //       (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
// //     );
// //   }

// //   if (query.trim()) {
// //     filteredProducts = filteredProducts.filter(
// //       (p) =>
// //         p.name?.toLowerCase().includes(query.toLowerCase()) ||
// //         p.category?.toLowerCase().includes(query.toLowerCase())
// //     );
// //   }

// //   const featuredProducts = products.slice(0, 6);
// //   const slides = Math.ceil(featuredProducts.length / 3);
// //   const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides);
// //   const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides) % slides);

// //   const handleSearch = () => {
// //     if (!query.trim()) {
// //       setError("Type something to search");
// //     } else {
// //       setError("");
// //       setShowFavorites(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-surface">
// //       {/* Navbar */}
// //       <Navbar
// //         setSelectedCategory={setSelectedCategory}
// //         setQuery={setQuery}
// //         setShowFavorites={setShowFavorites}
// //         showFavorites={showFavorites}
// //         favorites={favorites}
// //       />

// //       {/* Hero Section */}
// //       <div className="relative bg-gradient-hero pb-20 pt-12 sm:pt-16 lg:pt-20 overflow-hidden">
// //         {/* Background Pattern */}
// //         <div className="absolute inset-0 opacity-20"></div>
        
// //         <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
// //           <div className="max-w-4xl mx-auto">
// //             <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 animate-pulse">
// //               What are you looking to buy or sell? 🎓
// //             </h1>
// //             <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto">
// //               Connect with fellow students for amazing deals on textbooks, gadgets, and more!
// //             </p>
            
// //             {/* Search Bar */}
// //             <div className="max-w-2xl mx-auto">
// //               <div className="flex flex-col sm:flex-row items-center bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-white/95">
// //                 <div className="flex items-center w-full px-4 py-3 sm:py-4">
// //                   <Search className="text-muted-foreground shrink-0 mr-3" size={20} />
// //                   <Input
// //                     type="text"
// //                     placeholder="Search for textbooks, gadgets, furniture..."
// //                     value={query}
// //                     onChange={(e) => setQuery(e.target.value)}
// //                     className="flex-1 border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-sm sm:text-base"
// //                   />
// //                 </div>
// //                 <Button
// //                   onClick={handleSearch}
// //                   className="w-full sm:w-auto m-2 sm:mr-2 bg-gradient-primary hover:opacity-90 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
// //                 >
// //                   Search
// //                 </Button>
// //               </div>
// //               {error && (
// //                 <p className="text-destructive-foreground mt-2 text-sm bg-destructive/20 backdrop-blur-sm rounded-lg px-3 py-1 inline-block">
// //                   {error}
// //                 </p>
// //               )}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Curved Bottom */}
// //         <div className="absolute bottom-0 left-0 right-0">
// //           <svg
// //             xmlns="http://www.w3.org/2000/svg"
// //             viewBox="0 0 1440 120"
// //             className="w-full h-12 sm:h-16 lg:h-20"
// //           >
// //             <path
// //               fill="hsl(var(--background))"
// //               d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L0,120Z"
// //             />
// //           </svg>
// //         </div>
// //       </div>

// //       {/* Main Content */}
// //       <div className="flex flex-col lg:flex-row max-w-7xl mx-auto mt-8 sm:mt-10 lg:mt-12 px-4 sm:px-6 lg:px-8 gap-6 lg:gap-8">
        
// //         {/* Sidebar - Categories */}
// //         <aside className="w-full lg:w-1/5 bg-card rounded-xl shadow-sm border border-border/50 p-4 sm:p-6 h-fit sticky top-24">
// //           <Button
// //             variant="ghost"
// //             className="w-full justify-between lg:hidden mb-4 hover:bg-primary/10"
// //             onClick={() => setShowCategories(!showCategories)}
// //           >
// //             <span className="font-semibold">Categories</span>
// //             {showCategories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
// //           </Button>

// //           <ul
// //             className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 ${
// //               showCategories ? "block" : "hidden lg:block"
// //             }`}
// //           >
// //             {categories.map((cat) => (
// //               <li key={cat}>
// //                 <Button
// //                   variant="ghost"
// //                   onClick={() => {
// //                     setSelectedCategory(cat);
// //                     setShowFavorites(false);
// //                     setQuery("");
// //                     if (window.innerWidth < 1024) setShowCategories(false);
// //                   }}
// //                   className={`w-full justify-between text-sm sm:text-base py-2 px-3 transition-smooth hover:bg-primary/10 ${
// //                     selectedCategory === cat
// //                       ? "bg-primary/10 text-primary font-semibold"
// //                       : "hover:bg-muted"
// //                   }`}
// //                 >
// //                   {cat}
// //                   <ChevronRight size={14} />
// //                 </Button>
// //               </li>
// //             ))}
// //           </ul>
// //         </aside>

// //         {/* Main Content */}
// //         <main className="flex-1 space-y-8 lg:space-y-10">
          
// //           {/* Featured Products Section */}
// //           {!showFavorites && selectedCategory === "All" && !query && (
// //             <section>
// //               <div className="flex items-center justify-between mb-6">
// //                 <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
// //                   <span className="text-2xl">🔥</span>
// //                   Featured Products
// //                 </h2>
// //                 <div className="flex gap-2">
// //                   <Button
// //                     variant="outline"
// //                     size="sm"
// //                     onClick={prevSlide}
// //                     className="p-2 hover:bg-primary/10 transition-smooth"
// //                   >
// //                     <ChevronLeft size={16} />
// //                   </Button>
// //                   <Button
// //                     variant="outline"
// //                     size="sm"
// //                     onClick={nextSlide}
// //                     className="p-2 hover:bg-primary/10 transition-smooth"
// //                   >
// //                     <ChevronRight size={16} />
// //                   </Button>
// //                 </div>
// //               </div>

// //               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
// //                 {featuredProducts
// //                   .slice(currentSlide * 3, currentSlide * 3 + 3)
// //                   .map((product) => (
// //                     <ProductCard
// //                       key={product.id}
// //                       product={product}
// //                       isFavorite={favorites.includes(product.id)}
// //                       toggleFavorite={toggleFavorite}
// //                     />
// //                   ))}
// //               </div>
// //             </section>
// //           )}

// //           {/* All Products Section */}
// //           <section>
// //             <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-foreground flex items-center gap-2">
// //               {showFavorites ? (
// //                 <>
// //                   <Heart className="text-destructive fill-current" size={24} />
// //                   Your Favorites
// //                 </>
// //               ) : query ? (
// //                 <>
// //                   <Search className="text-accent" size={24} />
// //                   Search Results
// //                 </>
// //               ) : selectedCategory === "All" ? (
// //                 <>
// //                   <span className="text-2xl">🛒</span>
// //                   All Products
// //                 </>
// //               ) : (
// //                 <>
// //                   <span className="text-2xl">📦</span>
// //                   {selectedCategory} Products
// //                 </>
// //               )}
// //             </h2>
            
// //             {filteredProducts.length > 0 ? (
// //               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
// //                 {filteredProducts.map((product) => (
// //                   <ProductCard
// //                     key={product.id}
// //                     product={product}
// //                     isFavorite={favorites.includes(product.id)}
// //                     toggleFavorite={toggleFavorite}
// //                   />
// //                 ))}
// //               </div>
// //             ) : (
// //               <div className="text-center py-12">
// //                 <div className="text-6xl mb-4">😔</div>
// //                 <p className="text-muted-foreground text-lg">
// //                   {error || "No products found. Try a different search or category."}
// //                 </p>
// //               </div>
// //             )}
// //           </section>
// //         </main>
// //       </div>

// //       {/* Services Section */}
// //       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
// //         <div className="text-center mb-12">
// //           <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
// //             Why Choose CampusMart?
// //           </h2>
// //           <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
// //             We provide a safe, secure, and convenient platform for student-to-student commerce
// //           </p>
// //         </div>
        
// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
// //           <ServiceCard
// //             icon={<Truck className="text-primary w-8 h-8" />}
// //             title="Fast Delivery"
// //             description="Get your items delivered quickly and safely within campus or arrange convenient pickup."
// //           />
// //           <ServiceCard
// //             icon={<Shield className="text-primary w-8 h-8" />}
// //             title="Secure Transactions"
// //             description="Your transactions are protected with our trusted payment system and buyer protection."
// //           />
// //           <ServiceCard
// //             icon={<Package className="text-primary w-8 h-8" />}
// //             title="Quality Assured"
// //             description="Buy and sell only verified items with detailed condition reports and ratings."
// //           />
// //         </div>
// //       </section>

// //       {/* Footer */}
// //       <footer className="bg-foreground text-background py-10 lg:py-12">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
// //             <div className="col-span-1 sm:col-span-2 lg:col-span-1">
// //               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
// //                 <div className="w-6 h-6 bg-gradient-primary rounded-md"></div>
// //                 CampusMart
// //               </h3>
// //               <p className="text-background/70 text-sm leading-relaxed">
// //                 A marketplace built for students, by students. Buy and sell with
// //                 ease within your campus community.
// //               </p>
// //             </div>
            
// //             <div>
// //               <h3 className="text-lg font-bold mb-4">Quick Links</h3>
// //               <ul className="space-y-2 text-background/70 text-sm">
// //                 <li><Link to="/" className="hover:text-background transition-colors">Home</Link></li>
// //                 <li><Link to="/sell" className="hover:text-background transition-colors">Sell Product</Link></li>
// //                 <li><Link to="/favorites" className="hover:text-background transition-colors">Favorites</Link></li>
// //                 <li><Link to="/profile" className="hover:text-background transition-colors">My Profile</Link></li>
// //               </ul>
// //             </div>
            
// //             <div>
// //               <h3 className="text-lg font-bold mb-4">Support</h3>
// //               <ul className="space-y-2 text-background/70 text-sm">
// //                 <li><Link to="/help" className="hover:text-background transition-colors">Help Center</Link></li>
// //                 <li><Link to="/contact" className="hover:text-background transition-colors">Contact Us</Link></li>
// //                 <li><Link to="/report" className="hover:text-background transition-colors">Report Issue</Link></li>
// //                 <li><Link to="/safety" className="hover:text-background transition-colors">Safety Guidelines</Link></li>
// //               </ul>
// //             </div>
            
// //             <div>
// //               <h3 className="text-lg font-bold mb-4">Follow Us</h3>
// //               <div className="flex space-x-4">
// //                 <Button variant="ghost" size="sm" className="p-2 text-background/70 hover:text-background hover:bg-background/10">
// //                   <Facebook size={20} />
// //                 </Button>
// //                 <Button variant="ghost" size="sm" className="p-2 text-background/70 hover:text-background hover:bg-background/10">
// //                   <Twitter size={20} />
// //                 </Button>
// //                 <Button variant="ghost" size="sm" className="p-2 text-background/70 hover:text-background hover:bg-background/10">
// //                   <Instagram size={20} />
// //                 </Button>
// //               </div>
// //             </div>
// //           </div>
          
// //           <div className="border-t border-background/20 mt-8 pt-8 text-center text-background/50 text-sm">
// //             <p>&copy; {new Date().getFullYear()} CampusMart. All rights reserved. Made with ❤️ for students.</p>
// //           </div>
// //         </div>
// //       </footer>
// //     </div>
// //   );
// // };

// // export default Dashboard;


// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { ArrowLeft, Upload, MapPin, Tag, DollarSign, User } from "lucide-react";

// // ✅ Changed alias to direct paths
// import { Button } from "../../components/ui/button";
// import { Input } from "../../components/ui/input";
// import { Textarea } from "../../components/ui/textarea";
// import { Label } from "../../components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
// import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";

// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { createClient } from "/src/utils/supabase/client.ts";

// const AddProduct = () => {
//   const supabase = createClient();

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     price: "",
//     category: "",
//     subcategory: "",
//     condition: "new",
//     location: "",
//     city: "",
//     phone: "",
//     email: "",
//     seller: "" // ✅ added seller
//   });

//   const [images, setImages] = useState([]);

//   const categories = {
//     electronics: ["Mobile Phones", "Laptops", "TVs", "Audio", "Gaming"],
//     fashion: ["Men's Clothing", "Women's Clothing", "Shoes", "Bags", "Watches"],
//     vehicles: ["Cars", "Motorcycles", "Buses", "Trucks", "Parts"],
//     home: ["Furniture", "Appliances", "Decor", "Garden", "Tools"],
//     services: ["Cleaning", "Repair", "Tutoring", "Beauty", "Events"],
//     property: ["Houses", "Apartments", "Land", "Commercial", "Short Let"]
//   };

//   const nigerianStates = [
//     "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
//     "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
//     "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
//     "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
//     "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
//   ];

//   // ... keep your stateCities here

//   const handleImageChange = (e) => {
//     setImages([...e.target.files]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       let uploadedUrls = [];

//       // upload images to Supabase storage
//       for (let i = 0; i < images.length; i++) {
//         const file = images[i];
//         const filePath = `product-images/${Date.now()}-${file.name}`;
//         const { error: uploadError } = await supabase.storage
//           .from("product-images")
//           .upload(filePath, file);

//         if (uploadError) throw uploadError;

//         const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
//         uploadedUrls.push(data.publicUrl);
//       }

//       // save product in DB
//       const { error } = await supabase.from("products").insert([
//         {
//           title: formData.title,
//           description: formData.description,
//           price: formData.price,
//           category: formData.category,
//           subcategory: formData.subcategory,
//           condition: formData.condition,
//           location: formData.location,
//           city: formData.city,
//           phone: formData.phone,
//           email: formData.email,
//           seller: formData.seller, // ✅ seller added
//           images: uploadedUrls
//         }
//       ]);

//       if (error) throw error;

//       toast.success("✅ Product Listed Successfully!");
//       setFormData({
//         title: "",
//         description: "",
//         price: "",
//         category: "",
//         subcategory: "",
//         condition: "new",
//         location: "",
//         city: "",
//         phone: "",
//         email: "",
//         seller: "" // reset
//       });
//       setImages([]);
//     } catch (err) {
//       console.error(err);
//       toast.error("❌ Failed to publish product.");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Toast container (alerts) */}
//       <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

//       {/* Header */}
//       <header className="sticky top-0 z-10 bg-background border-b shadow">
//         <div className="container mx-auto px-4 py-4">
//           <div className="flex items-center gap-4">
//             <Link href="/">
//               <Button variant="ghost" size="sm">
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Back
//               </Button>
//             </Link>
//             <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
//               Add Your Product
//             </h1>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-8 max-w-4xl">
//         <form onSubmit={handleSubmit} className="space-y-8">
//           {/* ... keep other product fields */}


//           {/* Location & Seller */}
//           <Card className="shadow">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
//                 <MapPin className="h-6 w-6 text-pink-600" />
//                 Location, Contact & Seller Info
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="space-y-2">
//                 <Label className="text-lg flex items-center gap-2">
//                   <User className="h-5 w-5 text-pink-600" /> Seller Name *
//                 </Label>
//                 <Input
//                   placeholder="Enter seller's name"
//                   value={formData.seller}
//                   onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
//                   className="text-lg py-3"
//                   required
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label className="text-lg">State *</Label>
//                   <Select
//                     onValueChange={(value) => setFormData({ ...formData, location: value, city: "" })}
//                   >
//                     <SelectTrigger className="text-lg py-3">
//                       <SelectValue placeholder="Select your state" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {nigerianStates.map((state) => (
//                         <SelectItem key={state} value={state}>
//                           {state}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {formData.location && (
//                   <div className="space-y-2">
//                     <Label className="text-lg">City/LGA *</Label>
//                     <Select
//                       onValueChange={(value) => setFormData({ ...formData, city: value })}
//                     >
//                       <SelectTrigger className="text-lg py-3">
//                         <SelectValue placeholder="Select city/LGA" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {stateCities[formData.location]?.map((city) => (
//                           <SelectItem key={city} value={city}>
//                             {city}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <Label className="text-lg">Phone Number *</Label>
//                   <Input
//                     type="tel"
//                     placeholder="+234 xxx xxx xxxx"
//                     value={formData.phone}
//                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                     className="text-lg py-3"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label className="text-lg">Email Address</Label>
//                   <Input
//                     type="email"
//                     placeholder="your@email.com"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     className="text-lg py-3"
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Submit */}
//           <div className="flex gap-4 justify-end">
//             <Button variant="outline" type="button">
//               Save as Draft
//             </Button>
//             <Button
//               type="submit"
//               className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 text-lg shadow"
//             >
//               Publish Product
//             </Button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddProduct;
