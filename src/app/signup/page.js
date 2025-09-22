"use client";

import { useState } from "react";
import { useAuth } from "/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

export default function SignUpPage() {
  const { register, googleLogin } = useAuth(); // ✅ fixed
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);

  const passwordCriteria = {
    length: password.length >= 8,
    number: /\d/.test(password),
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await register(email.trim(), password); // ✅ use register
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await googleLogin(); // ✅ use googleLogin
      router.push("/dashboard");
    } catch (err) {
      setError("Google sign-in failed");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-black px-4">
      <div className="backdrop-blur-lg bg-white/10 dark:bg-gray-800/40 border border-white/20 dark:border-gray-700/40 rounded-2xl shadow-xl p-8 w-full max-w-md animate-fadeIn">
        
        <h2 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-md">
          Create Account
        </h2>

        {error && <p className="text-red-300 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/30 dark:bg-gray-700/30 text-white placeholder-gray-200 focus:ring-2 focus:ring-pink-400 outline-none"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              onFocus={() => setShowCriteria(true)}
              onBlur={() => setShowCriteria(password.length > 0)}
              className="w-full px-4 py-3 rounded-lg bg-white/30 dark:bg-gray-700/30 text-white placeholder-gray-200 focus:ring-2 focus:ring-pink-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-200 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {showCriteria && (
            <div className="mt-2 text-xs space-y-1">
              <p className={passwordCriteria.length ? "text-emerald-400" : "text-red-400"}>• At least 8 characters</p>
              <p className={passwordCriteria.number ? "text-emerald-400" : "text-red-400"}>• At least 1 number</p>
              <p className={passwordCriteria.uppercase ? "text-emerald-400" : "text-red-400"}>• At least 1 uppercase</p>
              <p className={passwordCriteria.lowercase ? "text-emerald-400" : "text-red-400"}>• At least 1 lowercase</p>
              <p className={passwordCriteria.specialChar ? "text-emerald-400" : "text-red-400"}>• At least 1 special char</p>
            </div>
          )}

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-white/30 dark:bg-gray-700/30 text-white placeholder-gray-200 focus:ring-2 focus:ring-pink-400 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-pink-500/80 hover:bg-pink-500 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-white/30" />
          <span className="px-2 text-white text-sm">OR</span>
          <hr className="flex-grow border-white/30" />
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-white/90 hover:bg-white text-gray-800 font-semibold shadow-md transition"
        >
          <FaGoogle size={22} /> Sign up with Google
        </button>

        <p className="mt-4 text-center text-white text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-pink-300 hover:text-pink-400 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}
