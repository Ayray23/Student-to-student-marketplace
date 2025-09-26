"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "/src/utils/supabase/client.ts";
import { ArrowLeft, ArrowRight, Check, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    phone: "",
    location: "",
    university: "",
    graduation_year: "",
    bio: "",
    avatar_url: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);

  // ✅ Fetch existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data: existing, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (error) {
        console.error("❌ Error fetching profile:", error.message);
        return;
      }

      if (existing) {
        setProfile(existing);
        setFormData({
          username: existing.username || "",
          full_name: existing.full_name || "",
          phone: existing.phone || "",
          location: existing.location || "",
          university: existing.university || "",
          graduation_year: existing.graduation_year || "",
          bio: existing.bio || "",
          avatar_url: existing.avatar_url || "",
        });
      }
    };
    fetchProfile();
  }, [supabase]);

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile) return formData.avatar_url;

    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `avatars/${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile);

    if (uploadError) {
      console.error("❌ Avatar upload error:", uploadError.message);
      return formData.avatar_url;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return data.publicUrl;
  };

  // ✅ Save profile
  const saveProfile = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    const avatarUrl = await handleAvatarUpload();

    const payload = {
      ...formData,
      avatar_url: avatarUrl,
      user_id: userData.user.id,
    };

    let query = supabase.from("profiles");

    if (profile) {
      // Update
      const { error } = await query.update(payload).eq("user_id", userData.user.id);
      if (error) console.error("❌ Update error:", error.message);
    } else {
      // Insert
      const { error } = await query.insert([payload]);
      if (error) console.error("❌ Insert error:", error.message);
    }

    setLoading(false);
    router.push("/dashboard");
  };

  // ✅ Remove avatar
  const removeAvatar = () => {
    setAvatarFile(null);
    setFormData({ ...formData, avatar_url: "" });
  };

  const steps = [
    {
      title: "Basic Info",
      fields: (
        <>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70"
          />
          <input
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70"
          />
        </>
      ),
    },
    {
      title: "Contact Info",
      fields: (
        <>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70"
          />
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70"
          />
        </>
      ),
    },
    {
      title: "Education",
      fields: (
        <>
          <input
            name="university"
            value={formData.university}
            onChange={handleChange}
            placeholder="University"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70"
          />
          <input
            type="number"
            name="graduation_year"
            value={formData.graduation_year}
            onChange={handleChange}
            placeholder="Graduation Year"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70"
          />
        </>
      ),
    },
    {
      title: "Profile Details",
      fields: (
        <>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Bio"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-white/70"
          />
          <div className="flex flex-col items-center">
            {avatarFile || formData.avatar_url ? (
              <div className="relative">
                <Image
                  src={
                    avatarFile ? URL.createObjectURL(avatarFile) : formData.avatar_url
                  }
                  alt="avatar preview"
                  width={100}
                  height={100}
                  className="rounded-full border-2 border-white/50"
                />
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/40 rounded-lg text-white/80">
                <Upload size={20} />
                <span className="mt-1 text-sm">Upload Avatar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </>
      ),
    },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 px-4">
      <div className="backdrop-blur-lg bg-white/10 border border-white/30 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          {steps[step].title}
        </h1>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {steps[step].fields}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-white/80 hover:text-white"
            >
              <ArrowLeft size={18} /> Back
            </button>
          ) : (
            <span />
          )}

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 bg-white/20 px-4 py-2 rounded-lg text-white hover:bg-white/30"
            >
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={saveProfile}
              disabled={loading}
              className="flex items-center gap-1 bg-green-500 px-4 py-2 rounded-lg text-white hover:bg-green-600"
            >
              {loading ? "Saving..." : <>Finish <Check size={18} /></>}
            </button>
          )}
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center mt-4 space-x-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === step ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
