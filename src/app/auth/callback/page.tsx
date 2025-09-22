"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import React from "react";

const supabase = createClient();


export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        router.push("/"); // redirect to homepage or dashboard
      } else {
        router.push("/login");
      }
    };

    checkSession();
  }, [router]);

  return <p className="text-center mt-10">Finishing login...</p>;
}
