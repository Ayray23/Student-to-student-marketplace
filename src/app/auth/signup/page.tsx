"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import React from "react";

const supabase = createClient();


export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert("Signup failed: " + error.message);
    } else {
      alert("Check your email to confirm your account!");
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold">Sign Up</h1>
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
        onClick={handleSignup}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Sign Up
      </button>
    </div>
  );
}
