"use client";

import { useEffect, useState, Fragment } from "react";
import { createClient } from "/src/utils/supabase/client";
import { Dialog, Transition } from "@headlessui/react";
import { X, Menu, PlusCircle, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function Dashboard() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newPrice, setNewPrice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch all products (sold + unsold for dashboard)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        toast.error("Failed to load products");
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Update price
  const updatePrice = async (id: string) => {
    if (!newPrice) return toast.warning("Enter a new price");

    const { error } = await supabase
      .from("products")
      .update({ price: newPrice })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update price");
    } else {
      toast.success("Price updated");
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, price: newPrice } : p))
      );
      setSelectedProduct((prev: any) =>
        prev ? { ...prev, price: newPrice } : null
      );
      setNewPrice("");
    }
  };

  // Mark as sold
  const markAsSold = async (id: string) => {
    const { error } = await supabase
      .from("products")
      .update({ is_sold: true })
      .eq("id", id);

    if (error) {
      toast.error("Failed to mark as sold");
    } else {
      toast.success("Product marked as sold");
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_sold: true } : p))
      );
      setSelectedProduct((prev) =>
        prev ? { ...prev, is_sold: true } : null
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed z-40 inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64 bg-white shadow-lg transition-transform duration-200 ease-in-out md:translate-x-0`}
      >
        <div className="p-6 flex flex-col h-full">
          <h2 className="text-2xl font-bold text-pink-600 mb-6">CampusMart</h2>
          <nav className="flex-1 space-y-4">
            <Link
              href="/dashboard"
              className="block text-gray-800 hover:text-pink-600"
            >
              Dashboard
            </Link>
            <Link
              href="/add-product"
              className="block text-gray-800 hover:text-pink-600"
            >
              Add Product
            </Link>
            <Link
              href="/profile"
              className="block text-gray-800 hover:text-pink-600"
            >
              Profile
            </Link>
          </nav>
          <button className="flex items-center gap-2 text-red-600 hover:text-red-800">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="flex items-center justify-between bg-white shadow px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-pink-600">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-3 py-1 border rounded-md text-sm focus:outline-pink-500"
              />
              <Search className="w-4 h-4 absolute left-2 top-2 text-gray-400" />
            </div>
            <img
              src="https://ui-avatars.com/api/?name=User"
              alt="user avatar"
              className="w-8 h-8 rounded-full border"
            />
          </div>
        </header>

        {/* Product Grid */}
        <main className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-500">No products yet</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`cursor-pointer ${
                    product.is_sold ? "opacity-50 grayscale" : ""
                  }`}
                >
                  {/* Card */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={
                          Array.isArray(product.images)
                            ? product.images[0]
                            : product.image
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-800 line-clamp-1 text-sm sm:text-base">
                        {product.name}
                      </h3>
                      <p className="text-lg sm:text-xl font-bold text-pink-600 mt-1">
                        ₦{product.price}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {product.category}
                      </p>
                      {product.is_sold && (
                        <span className="mt-2 block w-full text-center py-2 bg-gray-300 text-gray-700 rounded">
                          SOLD
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Floating Add Product Button */}
      <Link
        href="/add-product"
        className="fixed bottom-6 right-6 bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-lg"
      >
        <PlusCircle className="w-6 h-6" />
      </Link>

      {/* Product Modal */}
      <Transition appear show={!!selectedProduct} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setSelectedProduct(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <Dialog.Title className="text-lg font-bold">
                    {selectedProduct?.name}
                  </Dialog.Title>
                  <button onClick={() => setSelectedProduct(null)}>
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Image Gallery */}
                {selectedProduct?.images?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mb-4">
                    {selectedProduct.images.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt={selectedProduct.name}
                        className="h-40 w-40 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                )}

                {/* Details */}
                <p>
                  <strong>Price:</strong> ₦{selectedProduct?.price}
                </p>
                <p>
                  <strong>Category:</strong> {selectedProduct?.category}
                </p>
                <p>
                  <strong>Seller:</strong> {selectedProduct?.seller}
                </p>
                <p className="mb-4">
                  <strong>Description:</strong> {selectedProduct?.description}
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="number"
                    placeholder="Enter new price"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    disabled={selectedProduct?.is_sold}
                    className="border px-3 py-2 rounded w-full sm:w-auto disabled:bg-gray-100"
                  />
                  <button
                    onClick={() => updatePrice(selectedProduct.id)}
                    disabled={selectedProduct?.is_sold}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    Update Price
                  </button>
                  {!selectedProduct?.is_sold && (
                    <button
                      onClick={() => markAsSold(selectedProduct.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Mark as Sold
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
