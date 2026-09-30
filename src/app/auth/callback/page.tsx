"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        // Create the client at runtime, not while Next.js is building the page.
        const supabase = createClient();
        const { data, error } = await supabase.auth.getSession();

        if (cancelled) return;

        if (error) {
          console.error("Supabase callback session error:", error);
          router.replace("/login");
          return;
        }

        router.replace(data.session ? "/" : "/login");
      } catch (error) {
        console.error("Supabase configuration error:", error);
        if (!cancelled) router.replace("/login");
      }
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <div
          className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"
          aria-hidden="true"
        />
        <h1 className="text-lg font-semibold">Finishing login…</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Securely restoring your session.
        </p>
      </div>
    </main>
  );
}
