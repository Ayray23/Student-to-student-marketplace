"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";

export default function SplashScreen() {
  const router = useRouter();

  // Redirect after 15 sec → dashboard
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 15000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-black px-4">
      <div className="backdrop-blur-lg bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-700/30 rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fadeIn">
        
        <ShoppingBag
          size={64}
          className="text-white drop-shadow-md mb-4 animate-bounce"
        />
        
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">CampusMart</h1>
        <p className="text-white/80 text-center mt-2 text-lg">
          Connecting Students, One Deal at a Time
        </p>
      </div>
    </section>
  );
}
