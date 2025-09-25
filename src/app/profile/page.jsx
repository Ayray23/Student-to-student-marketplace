"use client";

import { useEffect, useState } from "react";
import { createClient } from "/src/utils/supabase/client.ts";
import { useAuth } from "/context/AuthContext";
import { Plus } from "lucide-react";

export default function ProfilePage() {
  const supabase = createClient();
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    bio: "",
    phone: "",
    location: "",
    university: "",
    graduation_year: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("❌ Error fetching profile:", error.message);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, supabase]);

  // ✅ Upload avatar
  const uploadAvatar = async () => {
    if (!avatarFile) return profile.avatar_url;

    try {
      setUploading(true);

      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("❌ Avatar upload failed:", err.message);
      return profile.avatar_url;
    } finally {
      setUploading(false);
    }
  };

  // ✅ Save profile
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const avatarUrl = await uploadAvatar();

    const { error } = await supabase
      .from("profiles")
      .update({ ...profile, avatar_url: avatarUrl })
      .eq("user_id", user.id);

    if (error) {
      console.error("❌ Error saving profile:", error.message);
      alert("Failed to save profile.");
    } else {
      setProfile({ ...profile, avatar_url: avatarUrl });
      alert("✅ Profile updated successfully!");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <section className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <form onSubmit={handleSave} className="space-y-4">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center relative">
          <div className="relative w-24 h-24">
            {profile.avatar_url || avatarFile ? (
              <img
                src={
                  avatarFile
                    ? URL.createObjectURL(avatarFile)
                    : profile.avatar_url
                }
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                No Image
              </div>
            )}

            {/* Plus Button Overlay */}
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer shadow-md hover:bg-blue-700"
            >
              <Plus size={16} />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                setAvatarFile(e.target.files?.[0] ? e.target.files[0] : null)
              }
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Tap the ➕ to upload a profile picture
          </p>
          {uploading && <p className="text-sm text-gray-400">Uploading...</p>}
        </div>

        {/* Profile Fields */}
        <input
          type="text"
          placeholder="Full Name"
          value={profile.full_name || ""}
          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          className="w-full border rounded-lg p-2"
        />

        <input
          type="text"
          placeholder="Username"
          value={profile.username || ""}
          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
          className="w-full border rounded-lg p-2"
        />

        <textarea
          placeholder="Bio"
          value={profile.bio || ""}
          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          className="w-full border rounded-lg p-2"
        />

        <input
          type="text"
          placeholder="Phone"
          value={profile.phone || ""}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          className="w-full border rounded-lg p-2"
        />

        <input
          type="text"
          placeholder="Location"
          value={profile.location || ""}
          onChange={(e) =>
            setProfile({ ...profile, location: e.target.value })
          }
          className="w-full border rounded-lg p-2"
        />

        <input
          type="text"
          placeholder="University"
          value={profile.university || ""}
          onChange={(e) =>
            setProfile({ ...profile, university: e.target.value })
          }
          className="w-full border rounded-lg p-2"
        />

        <input
          type="number"
          placeholder="Graduation Year"
          value={profile.graduation_year || ""}
          onChange={(e) =>
            setProfile({ ...profile, graduation_year: e.target.value })
          }
          className="w-full border rounded-lg p-2"
        />

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </section>
  );
}
