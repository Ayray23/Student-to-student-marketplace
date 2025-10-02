"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const supabase = createClient();
  const [user, setUser] = useState(null);

  // ✅ Register user + create profile
  const register = async (email, password, { username, phone }) => {
    // Step 1: Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Step 2: Insert profile row if user is created
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          user_id: data.user.id,
          username,
          phone,
          email: data.user.email, // optional
          full_name: "", // placeholder
          bio: "",
          location: "",
          university: "",
          graduation_year: null,
        },
      ]);

      if (profileError) {
        console.error("❌ Profile creation failed:", profileError.message);
        throw profileError;
      }
    }

    return data;
  };

  // ✅ Login user
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // ✅ Google login
  const googleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { access_type: "offline", prompt: "select_account" },
      },
    });
    if (error) throw error;

    // (Optional) create profile for Google users
    if (data?.user) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          user_id: data.user.id,
          username: data.user.user_metadata?.full_name || `user_${Date.now()}`,
          phone: null,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || "",
          avatar_url: data.user.user_metadata?.avatar_url || null,
          bio: "",
          location: "",
          university: "",
          graduation_year: null,
        },
      ]).single();

      if (profileError && profileError.code !== "23505") {
        // ignore duplicate key error if profile already exists
        console.error("❌ Google profile creation failed:", profileError.message);
      }
    }

    return data;
  };

  // ✅ Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ✅ Track user session
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    getSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{ user, register, login, googleLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
