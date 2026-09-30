import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a browser-side Supabase client only when it is actually needed.
 *
 * Keeping client creation lazy is important for Next.js builds: Vercel can
 * statically evaluate Client Components during "next build", while runtime
 * environment variables are supplied separately by the deployment platform.
 */
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
