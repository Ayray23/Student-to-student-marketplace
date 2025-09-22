"use client";
import { useShop } from "../context/ShopContext";

export default function CartDrawer({ open, close }) {
  const { cart, removeFromCart, increaseQty, decreaseQty } = useShop();

  // ✅ Calculate total
  const total = cart.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity,
    0
  );

  return (
    <div
      className={`fixed top-0 right-0 w-80 h-full bg-white dark:bg-gray-900 shadow-lg p-4 transform ${
        open ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 z-50 flex flex-col`}
    >
      <h2 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">
        Your Cart
      </h2>

      {cart.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No items yet.</p>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.products?.images || "/placeholder.png"}
                  alt={item.products?.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {item.products?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ₦{item.products?.price}
                  </p>
                </div>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => decreaseQty(item.id, item.quantity)}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                >
                  -
                </button>
                <span className="min-w-[20px] text-center text-sm font-medium text-gray-800 dark:text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() => increaseQty(item.id, item.quantity + 1)}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Footer with total */}
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Total:
          </span>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            ₦{total.toLocaleString()}
          </span>
        </div>

        <button
          className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition"
        >
          Checkout
        </button>

        <button
          onClick={close}
          className="mt-2 w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
