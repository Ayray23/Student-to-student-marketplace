"use client";

import { useEffect, useMemo, useRef, useState, Fragment, useCallback } from "react";
import { createClient } from "/src/utils/supabase/client";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Menu,
  PlusCircle,
  LogOut,
  Search,
  Heart,
  Filter,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Package,
  User,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/**
 * Dashboard.tsx
 * - Merged premium features + tablet fixes
 * - Sidebar: drawer on md and below, docked on lg+
 * - Topbar locked height, text contrast improved
 * - Product grid tuned for tablet: 2 columns, smaller gaps
 * - Charts responsive heights
 * - Modal header sticky and modal scrollable
 */

// -------------------------------
// Helpers / types
// -------------------------------
type Product = any;
type Profile = any;

export default function Dashboard() {
  const supabase = createClient();

  // data
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [user, setUser] = useState<any>(null);
  const [sellerProfile, setSellerProfile] = useState<Profile | null>(null);

  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "favorites">("products");

  // layout & theme
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("cm:theme");
      return stored ? stored === "dark" : false;
    } catch {
      return false;
    }
  });

  // pagination
  const pageSize = 12;
  const [page, setPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // infinite scroll observer ref
  const observerRef = useRef<IntersectionObserver | null>(null);

  // --------------------------------
  // Auth + fetch profile (on mount)
  // --------------------------------
  useEffect(() => {
    let mounted = true;
    const checkUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          window.location.href = "/login";
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (mounted) {
          setUser({
            id: authUser.id,
            email: authUser.email,
            ...authUser.user_metadata,
            profile,
          });
        }
      } catch (err) {
        console.error("Auth check error", err);
        toast.error("Auth check failed");
      }
    };

    checkUser();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  // persist theme
  useEffect(() => {
    try {
      localStorage.setItem("cm:theme", dark ? "dark" : "light");
    } catch {}
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  // --------------------------------
  // Server-side paginated fetch (per seller)
  // --------------------------------
  const fetchProductsPage = useCallback(
    async (pageIndex = 0) => {
      if (!user) return;
      loadingMoreRef.current = true;
      const from = pageIndex * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      loadingMoreRef.current = false;

      if (error) {
        console.error("fetchProductsPage:", error);
        toast.error("Failed to load products");
        return;
      }

      setTotalCount(count ?? null);
      if (pageIndex === 0) setProducts(data || []);
      else setProducts((prev) => [...prev, ...(data || [])]);
    },
    [supabase, user]
  );

  // initial fetch when user is known
  useEffect(() => {
    if (!user) return;
    setPage(0);
    setProducts([]);
    setLoading(true);
    fetchProductsPage(0).finally(() => setLoading(false));

    // fetch favorites as well when user appears
    (async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("id, product:products(*)")
        .eq("user_id", user.id);
      if (!error) setFavorites(data?.map((r: any) => r.product) || []);
    })();
  }, [user, fetchProductsPage, supabase]);

  // fetch subsequent pages
  useEffect(() => {
    if (page === 0) return;
    fetchProductsPage(page);
  }, [page, fetchProductsPage]);

  // infinite scroll observer
  useEffect(() => {
    // ensure sentinel is observed only once
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loadingMoreRef.current && totalCount !== null) {
            const alreadyLoaded = products.length;
            if (alreadyLoaded < (totalCount ?? 0)) {
              setPage((p) => p + 1);
            }
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );

    if (sentinelRef.current) obs.observe(sentinelRef.current);
    observerRef.current = obs;
    return () => obs.disconnect();
  }, [products.length, totalCount]);

  // --------------------------------
  // Seller profile when modal opens
  // --------------------------------
  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!selectedProduct?.seller_id) {
        setSellerProfile(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", selectedProduct.seller_id)
        .maybeSingle();
      setSellerProfile(data || null);
    };
    fetchSellerProfile();
  }, [selectedProduct, supabase]);

  // --------------------------------
  // Realtime subscription for products (this seller only)
  // --------------------------------
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("products:dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, (payload) => {
        const rec = payload.record;
        if (!rec || rec.seller_id !== user.id) return;
        if (payload.eventType === "INSERT") {
          setProducts((p) => [rec, ...p]);
        } else if (payload.eventType === "UPDATE") {
          setProducts((p) => p.map((x) => (x.id === rec.id ? { ...x, ...rec } : x)));
        } else if (payload.eventType === "DELETE") {
          setProducts((p) => p.filter((x) => x.id !== rec.id));
        }
      })
      .subscribe();

    return () => {
      try {
        channel.unsubscribe();
      } catch (e) {
        // fallback
        // @ts-ignore
        channel && channel.unsubscribe && channel.unsubscribe();
      }
    };
  }, [supabase, user]);

  // --------------------------------
  // Helpers
  // --------------------------------
  const imagesOf = (product: any) => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length) return product.images;
    if (product.image) return [product.image];
    return [];
  };

  const isFavorite = (productId: string) => favorites.some((p) => p?.id === productId);

  // toggle favorite (safe)
  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast.warn("Login required to favorite items");
      return;
    }

    const already = favorites.find((p) => p?.id === productId);
    if (already) {
      const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
      if (error) toast.error("Failed to remove favorite");
      else setFavorites((prev) => prev.filter((p) => p?.id !== productId));
    } else {
      const { error } = await supabase.from("favorites").insert([{ user_id: user.id, product_id: productId }]);
      if (error) toast.error("Failed to add favorite");
      else {
        const { data } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
        if (data) setFavorites((prev) => [...prev, data]);
      }
    }
  };

  // --------------------------------
  // Search / filtering client-side (on loaded pages)
  // --------------------------------
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let list = products.slice();
    if (term) {
      list = list.filter((p) => {
        return (
          String(p.name || "").toLowerCase().includes(term) ||
          String(p.category || "").toLowerCase().includes(term) ||
          String(p.description || "").toLowerCase().includes(term)
        );
      });
    }

    if (activeCategory) {
      list = list.filter((p) => p.category === activeCategory);
    }

    if (sortBy === "price_asc") list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === "price_desc") list.sort((a, b) => Number(b.price) - Number(a.price));
    else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return list;
  }, [products, searchTerm, activeCategory, sortBy]);

  // analytics memo
  const analytics = useMemo(() => {
    const totalProducts = products.length;
    const soldCount = products.filter((p) => p.is_sold).length;
    const totalSales = products.reduce((acc, p) => acc + (p.is_sold ? Number(p.price || 0) : 0), 0);
    const totalViews = products.reduce((acc, p) => acc + Number(p.views || 0), 0);

    const salesSeries = products
      .filter((p) => p.is_sold)
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((p) => ({ name: new Date(p.created_at).toLocaleDateString(), value: Number(p.price || 0) }));

    return { totalProducts, soldCount, totalSales, totalViews, salesSeries };
  }, [products]);

  const salesChartData = analytics.salesSeries.length ? analytics.salesSeries : [{ name: new Date().toLocaleDateString(), value: 0 }];

  // --------------------------------
  // Actions: update price, mark as sold
  // --------------------------------
  const updatePrice = async (id: string) => {
    if (!newPrice) return toast.warning("Enter a new price");
    const prev = [...products];

    setProducts((prevP) => prevP.map((p) => (p.id === id ? { ...p, price: newPrice } : p)));
    setSelectedProduct((prevS: any) => (prevS ? { ...prevS, price: newPrice } : null));

    const { error } = await supabase.from("products").update({ price: newPrice }).eq("id", id);
    if (error) {
      toast.error("Failed to update price");
      setProducts(prev);
    } else {
      toast.success("Price updated");
      setNewPrice("");
    }
  };

  const markAsSold = async (id: string) => {
    const prev = [...products];
    setProducts((prevP) => prevP.map((p) => (p.id === id ? { ...p, is_sold: true } : p)));
    setSelectedProduct((prevS: any) => (prevS ? { ...prevS, is_sold: true } : null));

    const { error } = await supabase.from("products").update({ is_sold: true }).eq("id", id);
    if (error) {
      toast.error("Failed to mark as sold");
      setProducts(prev);
    } else {
      toast.success("Product marked as sold");
    }
  };

  // --------------------------------
  // Logout
  // --------------------------------
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error("Failed to logout");
    else window.location.href = "/login";
  };

  // display list based on active tab
  const displayList = activeTab === "favorites" ? favorites : filtered;

  // --------------------------------
  // Layout tweaks for tablet (768x545)
  // - grid uses 2 columns at md
  // - smaller gaps (gap-4)
  // - charts have responsive heights
  // - header fixed height so it doesn't push content
  // --------------------------------

  return (
    <div className={`${dark ? "dark" : ""} flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100`}>
      {/* Sidebar docked on lg+, drawer for md and below */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white dark:bg-slate-800 shadow p-6 fixed inset-y-0 left-0 z-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-pink-600">CampusMart</h2>
        </div>

        <nav className="flex-1 space-y-3">
          <button onClick={() => { setActiveTab("products"); setSearchTerm(""); setActiveCategory(null); }} className={`w-full text-left ${activeTab === "products" ? "text-pink-600 font-semibold" : "text-slate-700 dark:text-slate-200 hover:text-pink-600"}`}>
            <div className="flex items-center gap-2"><Package className="w-4 h-4" /> My Products</div>
          </button>

          <button onClick={() => setActiveTab("favorites")} className={`w-full text-left ${activeTab === "favorites" ? "text-pink-600 font-semibold" : "text-slate-700 dark:text-slate-200 hover:text-pink-600"}`}>
            <div className="flex items-center gap-2"><Heart className="w-4 h-4" /> Favorites</div>
          </button>

          <Link href="/add-product" className="block text-slate-700 dark:text-slate-200 hover:text-pink-600">Add Product</Link>
          <Link href="/profile" className="block text-slate-700 dark:text-slate-200 hover:text-pink-600">Profile</Link>
        </nav>

        <div className="mt-auto border-t pt-4">
          {user && (
            <div className="flex items-center gap-3">
              <img src={user.profile?.avatar_url || user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.profile?.full_name || user.full_name || user.email)}`} alt="avatar" className="w-10 h-10 rounded-full border" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.profile?.full_name || user.full_name || "User"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300 truncate">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="text-red-600 hover:text-red-800" aria-label="Logout"><LogOut className="w-5 h-5" /></button>
            </div>
          )}
        </div>
      </aside>

      {/* Drawer overlay/sidebar for md and below
          Rendered always but toggled via transform so animations work nicely on open/close */}
      <div className="lg:hidden">
        <div
          className={`fixed inset-0 z-40 pointer-events-${sidebarOpen ? "auto" : "none"}`}
          aria-hidden={!sidebarOpen}
        >
          {/* overlay */}
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setSidebarOpen(false)}
          />
          {/* sliding drawer */}
          <div
            className={`absolute left-0 top-0 w-72 h-full bg-white dark:bg-slate-800 shadow p-6 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-pink-600">CampusMart</h3>
              <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-slate-700 dark:text-slate-200" /></button>
            </div>

            <nav className="space-y-3">
              <button onClick={() => { setActiveTab("products"); setSidebarOpen(false); }} className="w-full text-left text-slate-700 dark:text-slate-200">Products</button>
              <button onClick={() => { setActiveTab("favorites"); setSidebarOpen(false); }} className="w-full text-left text-slate-700 dark:text-slate-200">Favorites</button>
              <Link href="/add-product" className="block text-slate-700 dark:text-slate-200">Add Product</Link>
              <Link href="/profile" className="block text-slate-700 dark:text-slate-200">Profile</Link>
            </nav>

            <div className="mt-auto border-t pt-4">
              {user && (
                <div className="flex items-center gap-3">
                  <img src={user.profile?.avatar_url || user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.profile?.full_name || user.full_name || user.email)}`} alt="avatar" className="w-10 h-10 rounded-full border" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.profile?.full_name || user.full_name || "User"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-300 truncate">{user.email}</p>
                  </div>
                  <button onClick={handleLogout} className="text-red-600 hover:text-red-800" aria-label="Logout"><LogOut className="w-5 h-5" /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content area (has left margin only on lg because sidebar is docked) */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Topbar - locked height so it doesn't change layout on tablet */}
        <header className="h-14 md:h-14 flex items-center justify-between bg-white dark:bg-slate-800 px-4 py-2 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-slate-700 dark:text-slate-200" onClick={() => setSidebarOpen((s) => !s)} aria-label="Open sidebar"><Menu className="w-6 h-6" /></button>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">{activeTab}</h1>
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
            {/* Search (collapses gracefully) */}
            <div className="relative w-full max-w-md">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, categories..."
                className="pl-9 pr-3 py-2 rounded-md border text-sm w-full focus:outline-pink-500 dark:bg-slate-700 dark:border-slate-600 dark:placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 absolute left-2 top-2 text-slate-400" />
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setFilterOpen((f) => !f)} className="flex items-center gap-2 px-3 py-1 border rounded-md text-sm" aria-expanded={filterOpen}>
                <Filter className="w-4 h-4" /> {filterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <Link href="/add-product" className="hidden lg:inline-flex items-center gap-2 px-3 py-1 bg-pink-600 text-white rounded-md hover:bg-pink-700">
                <PlusCircle className="w-4 h-4" /> Add
              </Link>

              <button onClick={() => setDark((d) => !d)} className="px-2 py-1 rounded border text-sm">
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* user avatar (kept minimal in topbar) */}
              <img
                src={user?.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.profile?.full_name || user?.full_name || user?.email || "User")}`}
                alt="avatar"
                className="w-8 h-8 rounded-full border"
              />
            </div>
          </div>
        </header>

        {/* optional filter popup (keeps same structure) */}
        {filterOpen && (
          <div className="md:absolute md:right-6 md:top-16 z-30">
            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded shadow p-3 w-72">
              <div className="mb-2">
                <p className="text-xs text-slate-500 dark:text-slate-300">Category</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <button onClick={() => setActiveCategory(null)} className={`px-2 py-1 text-xs rounded ${activeCategory === null ? "bg-pink-100 text-pink-600" : "bg-slate-100 dark:bg-slate-700"}`}>All</button>
                  {categories.map((c) => (
                    <button key={c} onClick={() => setActiveCategory(c)} className={`px-2 py-1 text-xs rounded ${activeCategory === c ? "bg-pink-100 text-pink-600" : "bg-slate-100 dark:bg-slate-700"}`}>{c}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-300">Sort</p>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full mt-2 border rounded px-2 py-1 text-sm dark:bg-slate-700 dark:border-slate-600">
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="p-4 md:p-6 overflow-auto flex-1 pb-28">
          {/* Analytics tiles - chart height tuned for tablet */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-slate-800 rounded-lg p-3 md:p-4 shadow">
              <p className="text-xs text-slate-500 dark:text-slate-300">Total products</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{analytics.totalProducts}</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">{analytics.soldCount} sold</p>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-slate-800 rounded-lg p-3 md:p-4 shadow">
              <p className="text-xs text-slate-500 dark:text-slate-300">Total sales</p>
              <p className="text-2xl font-bold text-pink-600">₦{analytics.totalSales.toLocaleString()}</p>
              <p className="text-sm text-slate-500 dark:text-slate-300">Views: {analytics.totalViews}</p>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-slate-800 rounded-lg p-3 md:p-4 shadow">
              <p className="text-xs text-slate-500 dark:text-slate-300">Recent Sales</p>
              {/* responsive chart container height: small on mobile, medium on tablet, larger on desktop */}
              <div className="w-full h-20 md:h-28 lg:h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#1f2937" : "#e6e6e6"} />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </section>

          {/* Product grid
              - tablet (md) uses 2 columns
              - smaller gap to avoid vertical crowding on low-height tablets (e.g. 768x545)
              - images use a less tall aspect on md to avoid pushing content */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-3">
                  <div className="h-36 md:h-28 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-md mb-3" />
                  <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-700 animate-pulse mb-2" />
                  <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-700 animate-pulse" />
                </div>
              ))}
            </div>
          ) : displayList.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-300">No items found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayList.map((product, idx) => {
                const images = imagesOf(product);
                const fav = isFavorite(product.id);
                return (
                  <article
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden cursor-pointer ${product.is_sold ? "opacity-60 grayscale" : ""}`}
                  >
                    {/* on md, use slightly wider aspect to reduce vertical space */}
                    <div className="overflow-hidden">
                      <div className="w-full h-44 md:h-36 lg:h-44 bg-slate-50 dark:bg-slate-700">
                        {images.length > 0 ? (
                          <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-300">No Image</div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 md:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 text-sm md:text-base">{product.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 truncate">{product.category}</p>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                          aria-label={fav ? "Remove favorite" : "Add favorite"}
                          className={`p-2 rounded ${fav ? "bg-pink-50 text-pink-600" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"}`}
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-pink-600">₦{product.price}</p>
                        </div>
                        <div>
                          {product.is_sold ? <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded">SOLD</span> : null}
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button onClick={() => setSelectedProduct(product)} className="flex-1 px-3 py-2 border rounded text-sm bg-white dark:bg-slate-800">Quick view</button>
                        <Link href={`/product/${product.id}`} className="px-3 py-2 bg-pink-600 text-white rounded text-sm">Open</Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-8 mt-6" />

          {/* loading more */}
          {loadingMoreRef.current && <p className="text-center mt-4 text-slate-500 dark:text-slate-300">Loading more...</p>}
        </main>
      </div>

      {/* Floating Add Button - desktop only */}
      <Link href="/add-product" className="hidden lg:flex fixed bottom-6 right-6 bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-lg z-40">
        <PlusCircle className="w-6 h-6" />
      </Link>

      {/* Bottom Tab Bar - visible md and below; height trimmed so it doesn't steal space */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700 z-50 lg:hidden">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-3 py-2">
          <button onClick={() => setActiveTab("products")} className={`flex-1 flex flex-col items-center gap-1 py-1 ${activeTab === "products" ? "text-pink-600" : "text-slate-600 dark:text-slate-300"}`}>
            <Package className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </button>

          <button onClick={() => setActiveTab("favorites")} className={`flex-1 flex flex-col items-center gap-1 py-1 ${activeTab === "favorites" ? "text-pink-600" : "text-slate-600 dark:text-slate-300"}`}>
            <Heart className="w-5 h-5" />
            <span className="text-xs">Favs</span>
          </button>

          <div className="relative -mt-6">
            <Link href="/add-product" className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pink-600 text-white shadow-lg transform translate-y-0">
              <PlusCircle className="w-6 h-6" />
            </Link>
          </div>

          <button onClick={() => window.location.href = "/profile"} className="flex-1 flex flex-col items-center gap-1 py-1 text-slate-600 dark:text-slate-300">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>

          <button onClick={handleLogout} className="flex-1 flex flex-col items-center gap-1 py-1 text-slate-600 dark:text-slate-300">
            <LogOut className="w-5 h-5" />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </nav>

      {/* Product Modal */}
      <Transition appear show={!!selectedProduct} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedProduct(null)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                {/* sticky header */}
                <div className="sticky top-0 bg-white dark:bg-slate-800 z-20 border-b">
                  <div className="flex items-center justify-between p-4">
                    <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedProduct?.name}</Dialog.Title>
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleFavorite(selectedProduct?.id)} className={`p-2 rounded ${isFavorite(selectedProduct?.id) ? "bg-pink-50 text-pink-600" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"}`} aria-label="Toggle favorite">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button onClick={() => setSelectedProduct(null)} aria-label="Close modal"><X className="w-5 h-5 text-slate-600 dark:text-slate-200" /></button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex gap-4 overflow-x-auto mb-4">
                    {imagesOf(selectedProduct).length > 0 ? imagesOf(selectedProduct).map((img: string, idx: number) => (
                      <img key={idx} src={img} alt={selectedProduct?.name} className="h-40 w-40 object-cover rounded-md border" />
                    )) : <div className="text-slate-400 dark:text-slate-300">No images</div>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-300"><strong>Price:</strong> ₦{selectedProduct?.price}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-300"><strong>Category:</strong> {selectedProduct?.category}</p>

                      <div className="mt-4">
                        <p className="mb-2 font-medium text-slate-900 dark:text-slate-100">Description</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200">{selectedProduct?.description || 'No description provided'}</p>
                      </div>
                    </div>

                    <div>
                      {sellerProfile ? (
                        <div className="flex items-center gap-3">
                          <img src={sellerProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerProfile.full_name || 'Seller')}`} alt="Seller" className="w-12 h-12 rounded-full border" />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{sellerProfile.full_name || 'Unnamed Seller'}</p>
                            {sellerProfile.phone && <p className="text-sm text-slate-500 dark:text-slate-300">📞 {sellerProfile.phone}</p>}
                            {sellerProfile.location && <p className="text-sm text-slate-500 dark:text-slate-300">📍 {sellerProfile.location}</p>}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-300">Seller: {selectedProduct?.Seller || 'Unknown'}</p>
                      )}

                      <div className="mt-6 flex flex-col gap-3">
                        <input type="number" placeholder="New price" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} disabled={selectedProduct?.is_sold} className="border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600" />

                        <div className="flex gap-2">
                          <button onClick={() => updatePrice(selectedProduct?.id)} disabled={selectedProduct?.is_sold} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded">Update price</button>
                          {!selectedProduct?.is_sold && <button onClick={() => markAsSold(selectedProduct?.id)} className="flex-1 bg-red-600 text-white px-3 py-2 rounded">Mark as sold</button>}
                        </div>

                        <Link href={`/product/${selectedProduct?.id}`} className="block text-center border rounded px-3 py-2">Open product page</Link>
                      </div>
                    </div>
                  </div>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div >
  );
}

/* End of file */
