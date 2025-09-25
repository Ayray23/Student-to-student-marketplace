"use client";

import { useEffect, useState } from "react";
import { createClient } from "/src/utils/supabase/client.ts";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Plus, Trash2, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("❌ No logged in user:", userError?.message);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("❌ Error fetching profile:", error.message);
      } else {
        setProfile(data || { user_id: user.id, full_name: "", avatar_url: "" });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [supabase]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    let avatar_url = profile.avatar_url;

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, avatarFile);

      if (uploadError) {
        console.error("❌ Avatar upload error:", uploadError.message);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);
        avatar_url = publicUrlData.publicUrl;
      }
    }

    const { error } = await supabase.from("profiles").upsert({
      user_id: profile.user_id,
      full_name: profile.full_name,
      avatar_url,
    });

    if (error) {
      console.error("❌ Error saving profile:", error.message);
    } else {
      setProfile((prev) => ({ ...prev, avatar_url }));
    }

    setLoading(false);
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.avatar_url) return;

    const fileName = profile.avatar_url.split("/").pop();
    await supabase.storage.from("avatars").remove([fileName]);

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("user_id", profile.user_id);

    if (!error) {
      setProfile((prev) => ({ ...prev, avatar_url: null }));
    }
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-black">
        <p className="text-white text-lg font-semibold animate-pulse">
          ⏳ Loading profile...
        </p>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-black px-4">
      <div className="backdrop-blur-lg bg-white/20 dark:bg-gray-800/20 border border-white/30 dark:border-gray-700/30 rounded-2xl shadow-xl p-8 w-full max-w-md animate-fadeIn">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-white mb-6 hover:underline"
        >
          <ArrowLeft className="mr-2" /> Back
        </button>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <User /> My Profile
        </h1>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6">
          {profile?.avatar_url ? (
            <div className="relative">
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border border-white/40"
              />
              <button
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-white/50 rounded-full cursor-pointer hover:bg-white/10">
              <Plus size={24} className="text-white" />
              <span className="text-xs text-white">Add photo</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        {/* Profile Form */}
        <Input
          type="text"
          placeholder="Full Name"
          value={profile?.full_name || ""}
          onChange={(e) =>
            setProfile((prev) => ({ ...prev, full_name: e.target.value }))
          }
          className="mb-4 bg-white/60 dark:bg-gray-700/60"
        />

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </section>
  );
}
