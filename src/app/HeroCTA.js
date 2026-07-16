"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function HeroCTA() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setShow(profile?.role === "owner");
      }
      setLoading(false);
    }
    check();
  }, []);

  if (loading || !show) return null;

  return (
    <Link
      href="/add-hostel"
      className="inline-block bg-[#1E88E5] text-white font-semibold rounded-full px-8 py-3 hover:bg-[#1565c0] transition-colors text-lg"
    >
      List Your Property
    </Link>
  );
}