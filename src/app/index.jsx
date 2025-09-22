"use client";
import { useState } from "react";
import { ShopProvider } from "../context/ShopContext";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import BannerCarousel from "../components/BannerCarousel";
import ProductList from "../components/ProductList";
import AddProductModal from "../components/AddProductModal";
import CartDrawer from "../components/CartDrawer";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ShopProvider>
      <div className="flex">
        <Sidebar open={sidebarOpen} />
        <div className="flex-1">
          <Header
            setSearch={setSearch}
            toggleCart={() => setCartOpen(true)}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <main className="p-4">
            <BannerCarousel />

            <div className="flex justify-between items-center my-4">
              <h2 className="text-xl font-bold">Products</h2>
              <button
                onClick={() => setModalOpen(true)}
                className="px-3 py-2 bg-green-500 text-white rounded"
              >
                + Add Product
              </button>
            </div>

            <ProductList search={search} />
          </main>
        </div>

        <CartDrawer open={cartOpen} close={() => setCartOpen(false)} />
        <AddProductModal open={modalOpen} close={() => setModalOpen(false)} />
      </div>
    </ShopProvider>
  );
}
