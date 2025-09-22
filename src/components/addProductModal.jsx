"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const categories = [
  "Home & Office",
  "Fashion",
  "Electronics",
  "Health & Beauty",
  "Sports & Fitness",
  "Books",
];

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    phone: "",
    details: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.price || !form.category || !form.image || !form.phone || !form.details) {
      return setError("All fields are required.");
    }

    if (form.details.trim().split(/\s+/).length < 20) {
      return setError("Description must be at least 20 words.");
    }

    await addDoc(collection(db, "products"), {
      ...form,
      price: parseFloat(form.price),
      createdAt: new Date(),
    });

    setForm({ name: "", price: "", category: "", image: "", phone: "", details: "" });
    alert("Product added successfully ✅");
  };

  return (
    <section className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Add New Product</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="url"
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
        <input
          type="tel"
          placeholder="Phone Number (WhatsApp)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
        <textarea
          placeholder="Product Description (at least 20 words)"
          value={form.details}
          onChange={(e) => setForm({ ...form, details: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          rows="5"
          required
        ></textarea>

        <button
          type="submit"
          className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg"
        >
          Save Product
        </button>
      </form>
    </section>
  );
}