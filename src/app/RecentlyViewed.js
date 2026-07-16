"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function RecentlyViewed() {
  const [recentHostels, setRecentHostels] = useState([]);

  useEffect(() => {
    async function loadRecent() {
      let recentIds = [];
      try {
        recentIds = JSON.parse(localStorage.getItem("roomlink_recent") || "[]");
      } catch {
        recentIds = [];
      }

      if (recentIds.length === 0) return;

      const { data } = await supabase
        .from("hostels")
        .select("*")
        .in("id", recentIds.map(Number))
        .eq("status", "approved");

      if (data) {
        const ordered = recentIds
          .map((id) => data.find((h) => h.id === Number(id)))
          .filter(Boolean);
        setRecentHostels(ordered);
      }
    }
    loadRecent();
  }, []);

  if (recentHostels.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recently viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
        {recentHostels.map((hostel) => (
          <Link
            key={hostel.id}
            href={`/hostel/${hostel.id}`}
            className="group shrink-0 w-40"
          >
            <div className="rounded-2xl overflow-hidden mb-2">
              {hostel.images && hostel.images.length > 0 ? (
                <img
                  src={hostel.images[0]}
                  alt={hostel.name}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                  No photo
                </div>
              )}
            </div>
            <p className="font-semibold text-gray-900 text-sm truncate">{hostel.name}</p>
            <p className="text-gray-500 text-xs">{hostel.town}</p>
            <p className="text-gray-900 text-xs mt-1">
              <span className="font-semibold">GHC{hostel.price}</span> / month
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}