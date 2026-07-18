"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function MapPage() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHostels() {
      const { data } = await supabase
        .from("hostels")
        .select("*")
        .eq("status", "approved")
        .not("lat", "is", null)
        .not("lng", "is", null);
      setHostels((data || []).filter((h) => h.available !== false));
      setLoading(false);
    }
    loadHostels();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading map...
      </div>
    );
  }

  return (
    <div style={{ height: "calc(100vh - 64px)" }}>
      <MapView hostels={hostels} />
    </div>
  );
}