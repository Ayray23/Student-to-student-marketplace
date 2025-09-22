"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { createClient } from "/src/utils/supabase/client.ts"; // client-side supabase

export default function SplashScreen() {
  const router = useRouter();
  const supabase = createClient();
  const [products, setProducts] = useState([]);

  // Redirect after 15 sec
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 15000);
    return () => clearTimeout(timer);
  }, [router]);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      let { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("❌ Error fetching products:", error.message);
      } else {
        setProducts(data || []);
      }
    };
    fetchProducts();
  }, [supabase]);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-black px-4">
      <div className="backdrop-blur-lg bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-700/30 rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fadeIn">
        
        <ShoppingBag size={64} className="text-white drop-shadow-md mb-4 animate-bounce" />
        
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">CampusMart</h1>
        <p className="text-white/80 text-center mt-2 text-lg">
          Connecting Students, One Deal at a Time
        </p>

        {/* Show products preview */}
        <div className="mt-6 w-full">
          <h2 className="text-lg font-semibold text-white mb-3">🔥 Latest Products</h2>
          {products.length > 0 ? (
            <ul className="text-white/90 space-y-2 max-h-40 overflow-y-auto">
              {products.map((product) => (
                <li key={product.id} className="bg-white/10 px-3 py-2 rounded-lg">
                  {product.title} — ₦{product.price}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/70">No products yet...</p>
          )}
        </div>
      </div>
    </section>
  );
}
