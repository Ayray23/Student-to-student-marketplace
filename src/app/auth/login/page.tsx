"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) alert("Login failed: " + error.message);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Supabase is not configured."
      );
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) alert("Google login failed: " + error.message);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Supabase is not configured."
      );
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to continue to Campus Marketplace.
          </p>
        </div>

        <input
          type="email"
          value={email}
          placeholder="Email"
          autoComplete="email"
          className="rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-emerald-500"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          value={password}
          placeholder="Password"
          autoComplete="current-password"
          className="rounded-xl border px-4 py-3 outline-none transition focus:ring-2 focus:ring-emerald-500"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.99]"
        >
          Sign in
        </button>

        <button
          onClick={handleGoogleLogin}
          className="rounded-xl border px-4 py-3 font-semibold transition hover:bg-muted active:scale-[0.99]"
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}
