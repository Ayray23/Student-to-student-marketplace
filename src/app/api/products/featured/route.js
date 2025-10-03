import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = createClient();

  try {
    // Fetch featured products from Supabase
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true) // 👈 Make sure your DB has a `is_featured` column
      .limit(10);

    if (error) throw error;

    return NextResponse.json(products, { status: 200 });
  } catch (err) {
    console.error("Error fetching featured products:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
