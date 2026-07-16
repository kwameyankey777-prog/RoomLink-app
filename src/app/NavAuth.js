"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function NavAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(profile?.role || null);
      }

      setLoading(false);
    }
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        setRole(profile?.role || null);
      } else {
        setRole(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="w-24" />;
  }

  if (user) {
    return null;
  }

 return (
    <div className="flex gap-4 text-sm items-center">
      <Link href="/login/student" className="text-gray-600 hover:text-gray-900 transition-colors">
        Occupant Login
      </Link>
      <Link href="/login/owner" className="text-gray-600 hover:text-gray-900 transition-colors">
        Host Login
      </Link>
    </div>
  );
}