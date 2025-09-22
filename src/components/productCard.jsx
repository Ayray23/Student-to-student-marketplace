"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Trash2, Edit3 } from "lucide-react";
import { createClient } from "/src/utils/supabase/client.ts";

const supabase = createClient();

export function ProductCard({ product, isFavorite, toggleFavorite }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [newPrice, setNewPrice] = useState(product.price);

  // ✅ Delete product
  const handleDelete = async () => {
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) {
      console.error("Delete failed:", error);
    } else {
      window.location.reload(); // refresh products
    }
    setIsDeleteOpen(false);
  };

  // ✅ Update price
  const handleUpdatePrice = async () => {
    const { error } = await supabase
      .from("products")
      .update({ price: newPrice })
      .eq("id", product.id);

    if (error) {
      console.error("Price update failed:", error);
    } else {
      window.location.reload();
    }
    setIsPriceOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer relative">
        {/* Product Image */}
        <div className="aspect-square overflow-hidden">
          <img
            src={Array.isArray(product.images) ? product.images[0] : product.image}
            alt={product.name || product.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-800 line-clamp-1 text-sm sm:text-base">
            {product.name || product.title}
          </h3>
          <p className="text-lg sm:text-xl font-bold text-pink-600 mt-1">₦{product.price}</p>
          <p className="text-xs text-gray-500 mt-1">{product.category}</p>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={() => setIsPriceOpen(true)}
            className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <Dialog.Title className="text-lg font-bold mb-2">Delete Product</Dialog.Title>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove <span className="font-semibold">{product.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Price Update Modal */}
      <Dialog open={isPriceOpen} onClose={() => setIsPriceOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <Dialog.Title className="text-lg font-bold mb-2">Update Price</Dialog.Title>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg mb-4"
              placeholder="Enter new price"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsPriceOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePrice}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Update
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}