"use client";

import Navbar from "@/components/navbar"; // ensure this file exists
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import {
  Heart,
  Package,
  User,
  PlusCircle,
  LogOut,
  Bookmark,
  Menu,
  X,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "react-toastify";
import { Dialog, Transition } from "@headlessui/react";
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
import { Fragment } from "react";

type Product = any;
type Profile = any;

export default function UserDashboardPage() {
  const supabase = createClient();

  // state
  const [user, setUser] = useState<any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [savedItems, setSavedItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [activeTab, setActiveTab] = useState<"products" | "favorites" | "saved">("products");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem("cm:theme") === "dark";
    } catch {
      return false;
    }
  });

  // basic auth + profile fetch
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const authUser = data?.user ?? null;
        if (!authUser) {
          // optional: redirect unauthenticated users
          // window.location.href = "/login";
          setUser(null);
          return;
        }

        // try fetch custom profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (!mounted) return;
        setUser({
          id: authUser.id,
          email: authUser.email,
          ...authUser.user_metadata,
          profile,
        });
      } catch (err) {
        console.error("Auth/profile init error", err);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  // dark mode effect
  useEffect(() => {
    try {
      localStorage.setItem("cm:theme", dark ? "dark" : "light");
    } catch {}
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  // initial fetch of products/favorites/saved for the logged-in user
  useEffect(() => {
    if (!user) {
      setProducts([]);
      setFavorites([]);
      setSavedItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const { data: userProducts } = await supabase
          .from("products")
          .select("*")
          .eq("seller_id", user.id)
          .order("created_at", { ascending: false });

        setProducts(userProducts || []);

        const { data: favs } = await supabase
          .from("favorites")
          .select("id, product:products(*)")
          .eq("user_id", user.id);

        setFavorites(favs?.map((f: any) => f.product) || []);

        const { data: saved } = await supabase
          .from("saved_items")
          .select("id, product:products(*)")
          .eq("user_id", user.id);

        setSavedItems(saved?.map((s: any) => s.product) || []);
      } catch (err) {
        console.error("fetch initial data", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase, user]);

  // realtime subscription — use payload.new / payload.old so TS is happy
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel("products:dashboard");

    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "products" },
      (payload: any) => {
        // INSERT / UPDATE => payload.new
        if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
          const rec = payload.new as any;
          if (!rec || rec.seller_id !== user.id) return;

          if (payload.eventType === "INSERT") {
            setProducts((prev) => [rec, ...prev]);
          } else {
            setProducts((prev) => prev.map((p) => (p.id === rec.id ? { ...p, ...rec } : p)));
          }
        }

        // DELETE => payload.old
        if (payload.eventType === "DELETE") {
          const oldRec = payload.old as any;
          if (!oldRec) return;
          setProducts((prev) => prev.filter((p) => p.id !== oldRec.id));
        }
      }
    );

    // subscribe
    channel.subscribe();

    return () => {
      // remove channel when unmounting
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // fallback - older SDKs may use unsubscribe()
        // @ts-ignore
        channel && channel.unsubscribe && channel.unsubscribe();
      }
    };
  }, [supabase, user?.id]);

  // helpers
  const imagesOf = (product: any) => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length) return product.images;
    if (product.image) return [product.image];
    return [];
  };

  const isFavorite = (productId: string) => favorites.some((p) => p?.id === productId);

  const toggleFavorite = async (productId: string) => {
    if (!user) return toast.warn("Login required");
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // analytics quick calc
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

  // display list per active tab
  const displayList = activeTab === "favorites" ? favorites : activeTab === "saved" ? savedItems : products;

  // If Navbar component expects no props, passing user may cause TS error — cast to any when rendering to avoid breaking builds.
  const NavbarAny = (Navbar as unknown) as any;

  return (
    <div className={`${dark ? "dark" : ""} min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100`}>
      {/* Navbar (external component) */}
      <NavbarAny user={user} />

      <section className="min-h-[calc(100vh-64px)] flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex md:w-64 lg:w-72 bg-white dark:bg-slate-800 p-6 flex-col shadow">
          <SidebarContent user={user} activeTab={activeTab} setActiveTab={(t) => setActiveTab(t as any)} handleLogout={handleLogout} />
        </aside>

        {/* Mobile Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 w-72 h-full bg-white dark:bg-slate-800 p-6 shadow" onClick={(e) => e.stopPropagation()}>
              <SidebarContent user={user} activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t as any); setSidebarOpen(false); }} handleLogout={handleLogout} />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:ml-0">
          {/* topbar for mobile/tablet (still show avatar/search) */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button className="md:hidden" onClick={() => setSidebarOpen((s) => !s)}><Menu className="w-6 h-6" /></button>
              <h2 className="text-lg font-semibold capitalize">{activeTab}</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <input className="pl-8 pr-3 py-1 border rounded-md text-sm dark:bg-slate-700" placeholder="Search..." value={""} onChange={() => {}} />
                <Search className="w-4 h-4 absolute left-2 top-1.5 text-slate-400" />
              </div>

              <button onClick={() => setDark((d) => !d)} className="px-2 py-1 rounded border text-sm">
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <img src={user?.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.profile?.full_name || user?.full_name || user?.email || "User")}`} alt="avatar" className="w-8 h-8 rounded-full border" />
            </div>
          </div>

          {/* Analytics */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <div className="w-full h-24">
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

          {/* Product grid */}
          {loading ? (
            <div>Loading...</div>
          ) : displayList.length === 0 ? (
            <div className="text-center text-slate-500">No items found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayList.map((product) => (
                <article key={product.id} className={`bg-white dark:bg-slate-800 rounded-lg shadow p-0 overflow-hidden ${product.is_sold ? "opacity-60" : ""}`}>
                  <div className="w-full h-44 bg-slate-50 dark:bg-slate-700 overflow-hidden">
                    {imagesOf(product).length > 0 ? <img src={imagesOf(product)[0]} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>}
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 truncate">{product.category}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }} className={`p-2 rounded ${isFavorite(product.id) ? "bg-pink-50 text-pink-600" : "bg-slate-100 dark:bg-slate-700"}`} aria-label="toggle favorite"><Heart className="w-4 h-4" /></button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-lg font-bold text-pink-600">₦{product.price}</p>
                      {product.is_sold ? <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 rounded">SOLD</span> : null}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button onClick={() => setSelectedProduct(product)} className="flex-1 px-3 py-2 border rounded text-sm bg-white dark:bg-slate-800">Quick view</button>
                      <Link href={`/product/${product.id}`} className="px-3 py-2 bg-pink-600 text-white rounded text-sm">Open</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

        </main>
      </section>

      {/* Floating add button (desktop) */}
      <Link href="/add-product" className="hidden lg:flex fixed bottom-6 right-6 bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-lg z-40">
        <PlusCircle className="w-6 h-6" />
      </Link>

      {/* Bottom tab bar for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700 z-50 lg:hidden">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-3 py-2">
          <button onClick={() => setActiveTab("products")} className={`flex-1 flex flex-col items-center gap-1 py-1 ${activeTab === "products" ? "text-pink-600" : "text-slate-600 dark:text-slate-300"}`}><Package className="w-5 h-5" /><span className="text-xs">Home</span></button>
          <button onClick={() => setActiveTab("favorites")} className={`flex-1 flex flex-col items-center gap-1 py-1 ${activeTab === "favorites" ? "text-pink-600" : "text-slate-600 dark:text-slate-300"}`}><Heart className="w-5 h-5" /><span className="text-xs">Favs</span></button>
          <div className="relative -mt-6"><Link href="/add-product" className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pink-600 text-white shadow-lg transform translate-y-0"><PlusCircle className="w-6 h-6" /></Link></div>
          <button onClick={() => window.location.href = "/profile"} className="flex-1 flex flex-col items-center gap-1 py-1 text-slate-600 dark:text-slate-300"><User className="w-5 h-5" /><span className="text-xs">Profile</span></button>
          <button onClick={handleLogout} className="flex-1 flex flex-col items-center gap-1 py-1 text-slate-600 dark:text-slate-300"><LogOut className="w-5 h-5" /><span className="text-xs">Logout</span></button>
        </div>
      </nav>

      {/* Product modal (sticky header + scroll content) */}
      <Transition appear show={!!selectedProduct} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedProduct(null)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/40" /></Transition.Child>

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-slate-800 z-20 border-b">
                  <div className="flex items-center justify-between p-4">
                    <Dialog.Title className="text-lg font-semibold">{selectedProduct?.name}</Dialog.Title>
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleFavorite(selectedProduct?.id)} className={`p-2 rounded ${isFavorite(selectedProduct?.id) ? "bg-pink-50 text-pink-600" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"}`} aria-label="Toggle favorite"><Heart className="w-4 h-4" /></button>
                      <button onClick={() => setSelectedProduct(null)} aria-label="Close modal"><X className="w-5 h-5 text-slate-600 dark:text-slate-200" /></button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex gap-4 overflow-x-auto mb-4">
                    {imagesOf(selectedProduct).length > 0 ? imagesOf(selectedProduct).map((img: string, idx: number) => <img key={idx} src={img} alt={selectedProduct?.name} className="h-40 w-40 object-cover rounded-md border" />) : <div className="text-slate-400 dark:text-slate-300">No images</div>}
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
                      <p className="text-sm text-slate-500 dark:text-slate-300">Seller: {selectedProduct?.Seller || 'Unknown'}</p>
                      <div className="mt-6 flex flex-col gap-3">
                        <input type="number" placeholder="New price" value={""} onChange={() => {}} className="border rounded px-3 py-2 dark:bg-slate-700 dark:border-slate-600" />
                        <div className="flex gap-2">
                          <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded">Update price</button>
                          <button className="flex-1 bg-red-600 text-white px-3 py-2 rounded">Mark as sold</button>
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

/* SidebarContent typed to avoid TS errors when used earlier */
function SidebarContent({
  user,
  activeTab,
  setActiveTab,
  handleLogout,
}: {
  user: any;
  activeTab: string;
  setActiveTab: (t: "products" | "favorites" | "saved") => void;
  handleLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-8 h-8 text-pink-600" />
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{user?.profile?.full_name || user?.email || "Guest"}</p>
          <p className="text-xs text-slate-500 dark:text-slate-300">User Dashboard</p>
        </div>
      </div>

      <nav className="space-y-3 flex-1">
        <button onClick={() => setActiveTab("products")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left ${activeTab === "products" ? "bg-pink-100 text-pink-600" : "hover:bg-slate-100 dark:hover:bg-slate-700"}`}><Package className="w-4 h-4" /> My Products</button>

        <button onClick={() => setActiveTab("favorites")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left ${activeTab === "favorites" ? "bg-pink-100 text-pink-600" : "hover:bg-slate-100 dark:hover:bg-slate-700"}`}><Heart className="w-4 h-4" /> Favorites</button>

        <button onClick={() => setActiveTab("saved")} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left ${activeTab === "saved" ? "bg-pink-100 text-pink-600" : "hover:bg-slate-100 dark:hover:bg-slate-700"}`}><Bookmark className="w-4 h-4" /> Saved</button>

        <Link href="/add-product" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><PlusCircle className="w-4 h-4" /> Add Product</Link>
      </nav>

      <div className="mt-auto pt-4 border-t">
        {user && (
          <div className="flex items-center gap-3">
            <img src={user.profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.profile?.full_name || user.full_name || user.email)}`} alt="avatar" className="w-10 h-10 rounded-full border" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.profile?.full_name || user.full_name || "User"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-300 truncate">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="text-red-600 hover:text-red-800"><LogOut className="w-5 h-5" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
