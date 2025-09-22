"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Categories</h2>
          <button
            className="md:hidden text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <a href="#" className="block px-3 py-2 rounded-lg hover:bg-gray-200">
            Home & Office
          </a>
          <a href="#" className="block px-3 py-2 rounded-lg hover:bg-gray-200">
            Fashion
          </a>
          <a href="#" className="block px-3 py-2 rounded-lg hover:bg-gray-200">
            Electronics
          </a>
          <a href="#" className="block px-3 py-2 rounded-lg hover:bg-gray-200">
            Groceries
          </a>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white shadow px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-800">My Shop</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
