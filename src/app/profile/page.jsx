"use client";

import { useEffect, useState } from "react";
import { createClient } from "/src/utils/supabase/client.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Plus, Trash2 } from "lucide-react";

export default function ProfilePage() {
  const supabase = createClient();
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
        .maybeSingle(); // ✅ safer

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
      const { data, error: uploadError } = await supabase.storage
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

    // extract file name from URL
    const fileName = profile.avatar_url.split("/").pop();

    // delete from storage
    const { error: deleteError } = await supabase.storage
      .from("avatars")
      .remove([fileName]);

    if (deleteError) {
      console.error("❌ Error deleting avatar:", deleteError.message);
    }

    // update DB
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("user_id", profile.user_id);

    if (error) {
      console.error("❌ Error removing avatar in DB:", error.message);
    } else {
      setProfile((prev) => ({ ...prev, avatar_url: null }));
    }
  };

  if (loading) return <p className="text-center mt-6">⏳ Loading...</p>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <User /> Profile
      </h1>

      {/* Avatar Upload */}
      <div className="flex flex-col items-center mb-4">
        {profile?.avatar_url ? (
          <div className="relative">
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border"
            />
            <button
              onClick={handleRemoveAvatar}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-full cursor-pointer hover:bg-gray-100">
            <Plus size={24} />
            <span className="text-xs">Add photo</span>
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
        className="mb-3"
      />

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  );
}
