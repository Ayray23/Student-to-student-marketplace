"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const supabase = createClient();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);

  // ✅ Fetch user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };
    getUser();
  }, [supabase]);

  // ✅ Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (!error) setProducts(data || []);
    };
    fetchProducts();
  }, [supabase]);

  // ✅ Fetch cart items
  useEffect(() => {
    if (!user) return;
    const fetchCart = async () => {
      const { data, error } = await supabase
        .from("cart")
        .select("id, quantity, products (*)")
        .eq("user_id", user.id);
      if (!error) setCart(data || []);
    };
    fetchCart();
  }, [user, supabase]);

  // ✅ Add product to cart (if exists, increase qty)
  const addToCart = async (productId) => {
    if (!user) return alert("Please log in first");

    const existing = cart.find((c) => c.products?.id === productId);

    if (existing) {
      return increaseQty(existing.id, existing.quantity + 1);
    }

    const { data, error } = await supabase
      .from("cart")
      .insert([{ user_id: user.id, product_id: productId, quantity: 1 }])
      .select("id, quantity, products (*)")
      .single();

    if (!error && data) {
      setCart((prev) => [...prev, data]);
    }
  };

  // ✅ Remove item
  const removeFromCart = async (cartId) => {
    const { error } = await supabase.from("cart").delete().eq("id", cartId);
    if (!error) {
      setCart((prev) => prev.filter((c) => c.id !== cartId));
    }
  };

  // ✅ Increase quantity
  const increaseQty = async (cartId, newQty) => {
    const { data, error } = await supabase
      .from("cart")
      .update({ quantity: newQty })
      .eq("id", cartId)
      .select("id, quantity, products (*)")
      .single();

    if (!error && data) {
      setCart((prev) => prev.map((c) => (c.id === cartId ? data : c)));
    }
  };

  // ✅ Decrease quantity
  const decreaseQty = async (cartId, currentQty) => {
    if (currentQty === 1) {
      return removeFromCart(cartId);
    }

    const { data, error } = await supabase
      .from("cart")
      .update({ quantity: currentQty - 1 })
      .eq("id", cartId)
      .select("id, quantity, products (*)")
      .single();

    if (!error && data) {
      setCart((prev) => prev.map((c) => (c.id === cartId ? data : c)));
    }
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
