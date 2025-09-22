import { NextResponse } from "next/server";
import { connectDB } from "/src/lib/mongodb";
import Product from "/src/models/product";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({ featured: true }).limit(10);
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
