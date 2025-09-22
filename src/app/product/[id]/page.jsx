"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Phone,
  User,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "/src/utils/supabase/client.ts";

export default function ProductDetails() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClient();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Error fetching product:", error.message);
      } else {
        setProduct(data);

        if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
          setMainImage(data.images[0]);
          setCurrentIndex(0);
        } else {
          setMainImage(data.image);
        }

        // Fetch related products (same category, different id)
        if (data?.category) {
          const { data: relatedData, error: relatedError } = await supabase
            .from("products")
            .select("*")
            .eq("category", data.category)
            .neq("id", data.id)
            .limit(4);

          if (!relatedError) setRelated(relatedData || []);
        }
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">⏳ Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">❌ Product not found</p>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [product.image];
  const whatsappLink = product.phone
    ? `https://wa.me/234${product.phone.replace(/^0/, "")}`
    : null;

  const handlePrev = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
    setMainImage(images[newIndex]);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    setMainImage(images[newIndex]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-pink-600 hover:text-pink-700 transition"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Product Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        {/* Left: Image Gallery */}
        <div>
          <div className="relative">
            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-96 object-cover rounded-xl shadow"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 dark:bg-gray-700/70 p-2 rounded-full shadow hover:bg-white dark:hover:bg-gray-700 transition"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 dark:bg-gray-700/70 p-2 rounded-full shadow hover:bg-white dark:hover:bg-gray-700 transition"
                >
                  <ArrowRight size={20} />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {images.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`${product.title} ${idx + 1}`}
                  onClick={() => {
                    setMainImage(url);
                    setCurrentIndex(idx);
                  }}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition ${
                    mainImage === url ? "border-pink-600" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {product.title}
          </h1>
          <p className="text-pink-600 text-2xl font-semibold mt-2">
            ₦{product.price}
          </p>
          <p className="text-gray-500 text-sm mt-3">
            Category: <span className="font-medium">{product.category}</span>
          </p>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex gap-4 mt-6">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition shadow"
              >
                <Phone size={18} /> WhatsApp Seller
              </a>
            )}
            <button className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 px-5 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              <Heart size={18} /> Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* More Info */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Product Information
          </h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <Calendar size={18} className="text-pink-600" />
              Added on:{" "}
              {product.created_at
                ? new Date(product.created_at).toDateString()
                : "N/A"}
            </li>
            <li>
              <strong>Description:</strong> {product.description}
            </li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Seller Information
          </h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-300">
            <p className="flex items-center gap-2">
              <User size={18} className="text-pink-600" /> Seller:{" "}
              <span className="font-medium">
                {product.Seller || "Unknown Seller"}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={18} className="text-pink-600" /> Contact:{" "}
              <span className="font-medium">{product.phone || "N/A"}</span>
            </p>
            <p>Location: {product.location || "Not specified"}</p>
          </div>
        </div>
      </div>

      {/* Related Products */}
          {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition p-4"
              >
                <img
                  src={
                    Array.isArray(item.images) && item.images.length > 0
                      ? item.images[0]
                      : item.image
                  }
                  alt={item.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {item.title}
                </h3>
                <p className="text-pink-600 font-medium">₦{item.price}</p>
              </Link>
            ))}
          </div>

          {/* View More Button */}
          <div className="mt-6 text-center">
            <Link
              href={`/?category=${encodeURIComponent(product.category)}`}
              className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-medium px-6 py-3 rounded-lg shadow transition"
            >
              View More in {product.category}
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
