"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const supabase = createClient();
  const [user, setUser] = useState(null);

  // ✅ Register user + profile
  const register = async (email, password, { username, phone }) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // 👇 IMPORTANT: only insert profile if session exists
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: data.user.id,
        username,
        phone,
        email: data.user.email,
        full_name: "",
        bio: "",
        location: "",
        university: "",
        graduation_year: null,
      });

      if (profileError) {
        console.error("❌ Profile creation failed:", profileError.message);
        // Don’t throw → let signup succeed anyway
      }
    }
    return data;
  };

  // ✅ Email login
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // ✅ Google login (redirect flow)
  const googleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: { access_type: "offline", prompt: "select_account" },
      },
    });
    if (error) throw error;
  };

  // ✅ Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ✅ Track session + auto-sync profile
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);

      if (data.user) {
        // Ensure profile always exists (Google or Email login)
        const { error: profileError } = await supabase.from("profiles").upsert({
          user_id: data.user.id,
          email: data.user.email,
          username:
            data.user.user_metadata?.full_name ||
            `user_${data.user.id.substring(0, 6)}`,
          full_name: data.user.user_metadata?.full_name || "",
          avatar_url: data.user.user_metadata?.avatar_url || null,
        });

        if (profileError) {
          console.error("❌ Profile sync failed:", profileError.message);
        }
      }
    };
    getSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription?.subscription.unsubscribe();
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
