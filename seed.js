import mongoose from "mongoose";
import Product from "./src/models/product.js";
import { config } from "dotenv";

// explicitly load .env.local
config({ path: ".env.local" });

async function seed() {
  console.log("MONGODB_URI:", process.env.MONGODB_URI); // debug line

  await mongoose.connect(process.env.MONGODB_URI);

  await Product.deleteMany({});
  await Product.insertMany([
    { name: "Laptop", price: 300, image: "/images/laptop.png", category: "Electronics", featured: true },
    { name: "Headphones", price: 50, image: "/images/headphones.png", category: "Accessories", featured: true },
    { name: "Shoes", price: 40, image: "/images/shoes.png", category: "Fashion", featured: true },
  ]);

  console.log("Seeding done ✅");
  mongoose.connection.close();
}

seed();
