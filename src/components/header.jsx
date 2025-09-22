
"use client";
import { useState } from "react";
import { useShop } from "../context/ShopContext";
import { ShoppingCart, Menu } from "lucide-react";

export default function Header({ setSearch, toggleCart, toggleSidebar }) {
  const { cart } = useShop();

  return (
    <header className="flex items-center justify-between bg-white shadow px-4 py-3 sticky top-0 z-50">
      <button onClick={toggleSidebar} className="md:hidden">
        <Menu size={24} />
      </button>

      <input
        type="text"
        placeholder="Search products..."
        onChange={(e) => setSearch(e.target.value)}
        className="w-1/2 md:w-1/3 border rounded px-3 py-2"
      />

      <button onClick={toggleCart} className="relative">
        <ShoppingCart size={24} />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full px-1">
            {cart.length}
          </span>
        )}
      </button>
    </header>
  );
}
