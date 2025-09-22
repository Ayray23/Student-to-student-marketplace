"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();


import React from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Login failed: " + error.message);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:3000/auth/callback" },
    });
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold">Login</h1>
      <input
        type="email"
        placeholder="Email"
        className="border px-3 py-2 rounded"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border px-3 py-2 rounded"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Login
      </button>
      <button
        onClick={handleGoogleLogin}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Login with Google
      </button>
    </div>
  );
}
