"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);

  // Fetch single product
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading product...
      </div>
    );
  }

  // WhatsApp link
  const whatsappLink = `https://wa.me/${product.phone}?text=Hello, I'm interested in your product: ${product.name}`;

  return (
    <section className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="md:grid md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h2>
            <p className="text-pink-600 font-semibold text-xl mb-4">
              ${product.price}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Category: {product.category}
            </p>

            {/* Long Description */}
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-line">
              {product.details}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg"
              >
                Back
              </button>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Contact Seller on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}