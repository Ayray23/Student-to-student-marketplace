"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";




export default function Navbar() {
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // 🔑 Load dark mode preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") {
        document.documentElement.classList.add("dark");
        setDarkMode(true);
      }
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  // 🔑 Handle Supabase User
  useEffect(() => {
    
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="flex items-center justify-between bg-white dark:bg-gray-800 shadow px-4 sm:px-6 py-4 sticky top-0 z-50">
      {/* Logo + Brand */}
      <Link href="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full" />
        <h1 className="text-xl sm:text-2xl font-bold text-pink-600">
          CampusMart
        </h1>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User Section */}
        {user ? (
          <div className="flex items-center gap-2">
            <Link href="/user-dashboard">
              <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
                <User size={20} />
                
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login">
            <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              Login
            </button>
          </Link>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden flex items-center text-gray-600 dark:text-gray-200"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white dark:bg-gray-800 shadow-md rounded-b-lg flex flex-col items-start space-y-3 px-4 py-4 md:hidden">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => {
              toggleDarkMode();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>

          {user ? (
            <>
              <Link href="/user-dashboard" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                  <User size={20} /> Dashboard
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                Login
              </button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
