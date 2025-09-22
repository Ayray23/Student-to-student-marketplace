"use client";

import { useState } from "react";
import { useAuth } from "/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Chrome } from "lucide-react";

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push("/index"); // Redirect to the main page after login
    } catch (err) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await googleLogin();   // ✅ FIXED: use the one from AuthContext
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-black px-4">
      <div className="backdrop-blur-lg bg-white/10 dark:bg-gray-800/40 border border-white/20 dark:border-gray-700/40 rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeIn">
        
        {/* Title */}
        <h2 className="text-3xl font-bold mb-6 text-center text-white drop-shadow">
          Welcome Back
        </h2>

        {/* Error Message */}
        {error && (
          <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-900/40 text-white placeholder-gray-300 focus:ring-2 focus:ring-pink-500 outline-none"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-900/40 text-white placeholder-gray-300 focus:ring-2 focus:ring-pink-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-gray-200 hover:text-pink-400"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Google Login Button */}
        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              "Signing in..."
            ) : (
              <>
                <Chrome size={20} />
                Sign in with Google
              </>
            )}
          </button>
        </div>

        {/* Sign Up Link */}
        <p className="mt-4 text-center text-gray-200 text-sm">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-pink-300 hover:text-pink-400 font-semibold"
          >
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}
