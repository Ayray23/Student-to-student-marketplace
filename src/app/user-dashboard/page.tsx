"use client";

import { useEffect, useMemo, useRef, useState, Fragment } from "react";
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
  BarChart,
  Bar,
} from "recharts";

// Premium User Dashboard - enhanced with pagination, realtime, analytics, theme
export default function Dashboard() {
  const supabase = createClient();

  // data
  const [products, setProducts] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newPrice, setNewPrice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [SellerProfile, setSellerProfile] = useState<any>(null);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc">("newest");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // pagination / infinite scroll (server-side)
  const pageSize = 12; // products per page
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // theme
  const [dark, setDark] = useState(false);

  // ---------------------------------------------------------------------------
  // Auth + Profile
  // ---------------------------------------------------------------------------
  useEffect(() => {
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
          .single();

        setUser({ id: authUser.id, email: authUser.email, ...authUser.user_metadata, profile });
      } catch (err) {
        console.error(err);
        toast.error("Auth failed");
      }
    };

    checkUser();
  }, [supabase]);

  // ---------------------------------------------------------------------------
  // Server-side pagination: fetch one page (appends when page>0)
  // ---------------------------------------------------------------------------
  const fetchProductsPage = async (pageIndex = 0) => {
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
      console.error(error);
      toast.error("Failed to load products");
      return;
    }

    setTotalCount(count ?? null);

    if (pageIndex === 0) setProducts(data || []);
    else setProducts((prev) => [...prev, ...(data || [])]);
  };

  // reset + fetch first page when user changes
  useEffect(() => {
    if (!user) return;
    setPage(0);
    setProducts([]);
    setLoading(true);
    fetchProductsPage(0).finally(() => setLoading(false));
  }, [supabase, user]);

  // load more when page changes (except initial load handled above)
  useEffect(() => {
    if (page === 0) return;
    fetchProductsPage(page);
  }, [page]);

  // infinite scroll observer
  useEffect(() => {
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
    return () => obs.disconnect();
  }, [products.length, totalCount]);

  // ---------------------------------------------------------------------------
  // Fetch favorites (optional)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("favorites")
        .select("id, product:products(*)")
        .eq("user_id", user.id);

      if (error) {
        console.info("Favorites fetch skipped or failed:", error.message);
        return;
      }

      setFavorites(data?.map((r) => r.product) || []);
    };

    fetchFavorites();
  }, [supabase, user]);

  // ---------------------------------------------------------------------------
  // Seller profile for modal
  // ---------------------------------------------------------------------------
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
        .single();

      setSellerProfile(data || null);
    };

    fetchSellerProfile();
  }, [selectedProduct, supabase]);

  // ---------------------------------------------------------------------------
  // Utilities: image fallback, check favorite
  // ---------------------------------------------------------------------------
  const imagesOf = (product: any) => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) return product.images;
    if (product.image) return [product.image];
    return [];
  };

  const isFavorite = (productId: string) => favorites.some((p) => p?.id === productId);

  // ---------------------------------------------------------------------------
  // Search / Filtered list (client-side on loaded pages)
  // ---------------------------------------------------------------------------
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
    else list.sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

    return list;
  }, [products, searchTerm, activeCategory, sortBy]);

  // ---------------------------------------------------------------------------
  // Analytics (simple): compute totals for charts
  // ---------------------------------------------------------------------------
  const analytics = useMemo(() => {
    const totalProducts = products.length;
    const soldCount = products.filter((p) => p.is_sold).length;
    const totalSales = products.reduce((acc, p) => acc + (p.is_sold ? Number(p.price || 0) : 0), 0);
    const totalViews = products.reduce((acc, p) => acc + Number(p.views || 0), 0);

    // simple timeseries: last N products sales by created_at (for chart)
    const salesSeries = products
      .filter((p) => p.is_sold)
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((p) => ({ name: new Date(p.created_at).toLocaleDateString(), value: Number(p.price || 0) }));

    return { totalProducts, soldCount, totalSales, totalViews, salesSeries };
  }, [products]);

  // ---------------------------------------------------------------------------
  // Actions: update price, mark as sold (optimistic updates)
  // ---------------------------------------------------------------------------
  const updatePrice = async (id: string) => {
    if (!newPrice) return toast.warning("Enter a new price");
    const prevProducts = [...products];

    // optimistic update
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, price: newPrice } : p)));
    setSelectedProduct((prev: any) => (prev ? { ...prev, price: newPrice } : null));

    const { error } = await supabase.from("products").update({ price: newPrice }).eq("id", id);
    if (error) {
      toast.error("Failed to update price");
      setProducts(prevProducts);
    } else {
      toast.success("Price updated");
      setNewPrice("");
    }
  };

  const markAsSold = async (id: string) => {
    const prevProducts = [...products];
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_sold: true } : p)));
    setSelectedProduct((prev) => (prev ? { ...prev, is_sold: true } : null));

    const { error } = await supabase.from("products").update({ is_sold: true }).eq("id", id);
    if (error) {
      toast.error("Failed to mark as sold");
      setProducts(prevProducts);
    } else {
      toast.success("Product marked as sold");
    }
  };

  // ---------------------------------------------------------------------------
  // Favorites toggles (safe checks) - add/remove
  // ---------------------------------------------------------------------------
  const toggleFavorite = async (productId: string) => {
    if (!user) return toast.warn("You must be logged in to favorite items");

    const already = favorites.find((p) => p?.id === productId);

    if (already) {
      const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
      if (error) {
        toast.error("Failed to remove favorite");
      } else {
        setFavorites((prev) => prev.filter((p) => p?.id !== productId));
        toast.success("Removed from favorites");
      }
    } else {
      const { error } = await supabase.from("favorites").insert([{ user_id: user.id, product_id: productId }]);
      if (error) {
        toast.error("Failed to add favorite");
      } else {
        const { data } = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
        if (data) setFavorites((prev) => [...prev, data]);
        toast.success("Added to favorites");
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Realtime: listen for changes on the products table and keep list fresh
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    // subscribe to products changes
    const channel = supabase
      .channel("public:products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, (payload) => {
        // payload.eventType = INSERT/UPDATE/DELETE
        const rec = payload.record;

        // only act on changes that concern this seller
        if (!rec || rec.seller_id !== user.id) return;

        if (payload.eventType === "INSERT") {
          // prepend new product
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
        // fallback for older SDKs
        // @ts-ignore
        channel && channel.unsubscribe && channel.unsubscribe();
      }
    };
  }, [supabase, user]);

  // ---------------------------------------------------------------------------
  // theme handling
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error("Failed to logout");
    else window.location.href = "/login";
  };

  // ---------------------------------------------------------------------------
  // small helpers for charts
  // ---------------------------------------------------------------------------
  const salesChartData = analytics.salesSeries.length
    ? analytics.salesSeries
    : [{ name: new Date().toLocaleDateString(), value: 0 }];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className={`${dark ? "dark" : ""} flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100`}>
      {/* Sidebar */}
      <aside className={`fixed z-40 inset-y-0 left-0 w-72 bg-white dark:bg-slate-800 shadow-lg p-6 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-pink-600">CampusMart</h2>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"><X className="w-5 h-5 text-slate-600"/></button>
        </div>

        <nav className="space-y-3">
          <button onClick={() => { setActiveCategory(null); setSearchTerm(""); }} className="block text-slate-700 hover:text-pink-600 font-medium">My Products</button>
          <Link href="/add-product" className="block text-slate-700 hover:text-pink-600">Add Product</Link>
          <Link href="/profile" className="block text-slate-700 hover:text-pink-600">Profile</Link>
        </nav>

        <div className="mt-6 space-y-2">
          <div className="rounded bg-slate-50 dark:bg-slate-700 p-3">
            <p className="text-xs text-slate-500">Theme</p>
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => setDark(false)} className={`px-2 py-1 rounded ${!dark? 'bg-pink-100 text-pink-600':'bg-slate-100 dark:bg-slate-600'}`}><Sun className="w-4 h-4"/></button>
              <button onClick={() => setDark(true)} className={`px-2 py-1 rounded ${dark? 'bg-pink-100 text-pink-600':'bg-slate-100 dark:bg-slate-600'}`}><Moon className="w-4 h-4"/></button>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t">
          {user && (
            <div className="flex items-center gap-3">
              <img src={user.profile?.avatar_url || user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.profile?.full_name||user.full_name||user.email)}`} alt="avatar" className="w-10 h-10 rounded-full border" />
              <div className="flex-1">
                <p className="text-sm font-medium">{user.profile?.full_name || user.full_name || "User"}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <button onClick={handleLogout} className="text-red-600 hover:text-red-800" aria-label="Logout"><LogOut className="w-5 h-5"/></button>
            </div>
          )}
        </div>
      </aside>

      {/* overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 md:ml-72 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white dark:bg-slate-800 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Open sidebar"><Menu className="w-6 h-6 text-slate-700 dark:text-slate-200"/></button>
            <h1 className="text-lg font-semibold">Dashboard</h1>

            {/* search + filters */}
            <div className="ml-4 flex items-center gap-2">
              <div className="relative">
                <input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="Search products, categories..." className="pl-9 pr-3 py-1 rounded-md border text-sm w-64 focus:outline-pink-500 dark:bg-slate-700 dark:border-slate-600" />
                <Search className="w-4 h-4 absolute left-2 top-1.5 text-slate-400" />
              </div>

              <div className="relative">
                <button onClick={()=>setFilterOpen(!filterOpen)} className="flex items-center gap-2 px-3 py-1 border rounded-md text-sm" aria-expanded={filterOpen}><Filter className="w-4 h-4"/>{filterOpen ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}</button>
                {filterOpen && (
                  <div className="absolute mt-2 left-0 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded shadow p-3 w-72 z-30">
                    <div className="mb-2">
                      <p className="text-xs text-slate-500">Category</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <button onClick={()=>setActiveCategory(null)} className={`px-2 py-1 text-xs rounded ${activeCategory===null? 'bg-pink-100 text-pink-600' : 'bg-slate-100 dark:bg-slate-700'}`}>All</button>
                        {categories.map((c)=> (
                          <button key={c} onClick={()=>setActiveCategory(c)} className={`px-2 py-1 text-xs rounded ${activeCategory===c? 'bg-pink-100 text-pink-600' : 'bg-slate-100 dark:bg-slate-700'}`}>{c}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Sort</p>
                      <select value={sortBy} onChange={(e)=> setSortBy(e.target.value as any)} className="w-full mt-2 border rounded px-2 py-1 text-sm dark:bg-slate-700 dark:border-slate-600">
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: Low → High</option>
                        <option value="price_desc">Price: High → Low</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/add-product" className="inline-flex items-center gap-2 px-3 py-1 bg-pink-600 text-white rounded-md hover:bg-pink-700"><PlusCircle className="w-4 h-4"/> Add</Link>
            <button onClick={() => setDark((d) => !d)} className="px-2 py-1 rounded border text-sm">{dark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}</button>
            <img src={user?.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.profile?.full_name||user?.full_name||user?.email||'User')}`} alt="avatar" className="w-8 h-8 rounded-full border" />
          </div>
        </header>

        {/* Content area */}
        <main className="p-6 overflow-auto flex-1">
          {/* Analytics tiles */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
              <p className="text-xs text-slate-500">Total products</p>
              <p className="text-2xl font-bold">{analytics.totalProducts}</p>
              <p className="text-sm text-slate-500">{analytics.soldCount} sold</p>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
              <p className="text-xs text-slate-500">Total sales</p>
              <p className="text-2xl font-bold text-pink-600">₦{analytics.totalSales.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Views: {analytics.totalViews}</p>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
              <p className="text-xs text-slate-500">Recent Sales</p>
              <div style={{ width: "100%", height: 60 }}>
                <ResponsiveContainer>
                  <LineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#ec4899" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </section>

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
                  <div className="h-36 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-md mb-3" />
                  <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-700 animate-pulse mb-2" />
                  <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-700 animate-pulse" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-slate-500">No products found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((product) => {
                const images = imagesOf(product);
                const fav = isFavorite(product.id);

                return (
                  <article key={product.id} className={`bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden ${product.is_sold ? "opacity-60 grayscale" : ""}`}>
                    <div className="aspect-square bg-slate-50 dark:bg-slate-700 overflow-hidden">
                      {images.length > 0 ? (
                        <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">{product.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 truncate">{product.category}</p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product.id);
                          }}
                          aria-label={fav ? "Remove favorite" : "Add favorite"}
                          className={`p-2 rounded ${fav ? "bg-pink-50 text-pink-600" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"}`}>
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-pink-600">₦{product.price}</p>
                        </div>
                        <div>
                          {product.is_sold ? <span className="px-2 py-1 text-xs bg-slate-200 rounded">SOLD</span> : null}
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button onClick={() => setSelectedProduct(product)} className="flex-1 px-3 py-2 border rounded text-sm">Quick view</button>
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

          {/* show loading more indicator */}
          {loadingMoreRef.current && <p className="text-center mt-4 text-slate-500">Loading more...</p>}
        </main>
      </div>

      {/* Floating action */}
      <Link href="/add-product" className="fixed bottom-6 right-6 bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-lg">
        <PlusCircle className="w-6 h-6" />
      </Link>

      {/* Product Modal (scrollable + sticky header) */}
      <Transition appear show={!!selectedProduct} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedProduct(null)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-slate-800 z-20 border-b">
                  <div className="flex items-center justify-between p-4">
                    <Dialog.Title className="text-lg font-semibold">{selectedProduct?.name}</Dialog.Title>
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleFavorite(selectedProduct?.id)} className={`p-2 rounded ${isFavorite(selectedProduct?.id) ? 'bg-pink-50 text-pink-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`} aria-label="Toggle favorite"><Heart className="w-4 h-4"/></button>
                      <button onClick={() => setSelectedProduct(null)} aria-label="Close modal"><X className="w-5 h-5 text-slate-600 dark:text-slate-200"/></button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex gap-4 overflow-x-auto mb-4">
                    {imagesOf(selectedProduct).length > 0 ? imagesOf(selectedProduct).map((img: string, idx: number) => (
                      <img key={idx} src={img} alt={selectedProduct?.name} className="h-40 w-40 object-cover rounded-md border" />
                    )) : <div className="text-slate-400">No images</div>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500"><strong>Price:</strong> ₦{selectedProduct?.price}</p>
                      <p className="text-sm text-slate-500"><strong>Category:</strong> {selectedProduct?.category}</p>

                      <div className="mt-4">
                        <p className="mb-2 font-medium">Description</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200">{selectedProduct?.description || 'No description provided'}</p>
                      </div>
                    </div>

                    <div>
                      {SellerProfile ? (
                        <div className="flex items-center gap-3">
                          <img src={SellerProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(SellerProfile.full_name || 'Seller')}`} alt="Seller" className="w-12 h-12 rounded-full border" />
                          <div>
                            <p className="font-medium">{SellerProfile.full_name || 'Unnamed Seller'}</p>
                            {SellerProfile.phone && <p className="text-sm text-slate-500">📞 {SellerProfile.phone}</p>}
                            {SellerProfile.location && <p className="text-sm text-slate-500">📍 {SellerProfile.location}</p>}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Seller: {selectedProduct?.Seller || 'Unknown'}</p>
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
    </div>
  );
}
