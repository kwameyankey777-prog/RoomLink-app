"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

function getRecentIds() {
  try {
    return JSON.parse(localStorage.getItem("roomlink_recent") || "[]");
  } catch {
    return [];
  }
}

function saveRecentIds(ids) {
  localStorage.setItem("roomlink_recent", JSON.stringify(ids));
}

export default function RecentlyViewed() {
  const [recentHostels, setRecentHostels] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    async function loadRecent() {
      const recentIds = getRecentIds();
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

  function removeOne(id) {
    const ids = getRecentIds().filter((rid) => Number(rid) !== Number(id));
    saveRecentIds(ids);
    setRecentHostels((prev) => prev.filter((h) => h.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function clearAll() {
    localStorage.removeItem("roomlink_recent");
    setRecentHostels([]);
    setExpandedId(null);
  }

  function closeExpanded() {
    setClosing(true);
    setTimeout(() => {
      setExpandedId(null);
      setClosing(false);
    }, 200);
  }

  if (recentHostels.length === 0) return null;

  const expandedHostel = recentHostels.find((h) => h.id === expandedId);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Recently viewed</h2>
        <button
          onClick={clearAll}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div
        className="relative h-52 overflow-x-auto overflow-y-hidden pb-2 -mx-6 px-6 scrollbar-hide"
        style={{ width: "100%" }}
      >
        <div
          className="relative h-48"
          style={{ width: `${recentHostels.length * 44 + 144}px` }}
        >
          {recentHostels.map((hostel, i) => (
            <div
              key={hostel.id}
              onClick={() => setExpandedId(hostel.id)}
              style={{
                left: `${i * 44}px`,
                zIndex: i,
                transform: `rotate(${i % 2 === 0 ? -3 : 3}deg)`,
              }}
              className="absolute top-0 w-36 h-48 rounded-2xl overflow-hidden shadow-md border-2 border-white cursor-pointer transition-transform duration-200 hover:-translate-y-2 hover:z-50 hover:rotate-0 bg-white"
            >
              {hostel.images && hostel.images.length > 0 ? (
                <img
                  src={hostel.images[0]}
                  alt={hostel.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                  No photo
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-xs font-semibold truncate">{hostel.name}</p>
                <p className="text-white/80 text-[10px]">{hostel.town}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeOne(hostel.id);
                }}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 hover:bg-red-500 text-white flex items-center justify-center text-[10px] transition-colors"
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {expandedHostel && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 transition-opacity duration-200 ${
            closing ? "opacity-0" : "opacity-100"
          }`}
          onClick={closeExpanded}
        >
          <div
            className={`bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl transition-all duration-200 ${
              closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {expandedHostel.images && expandedHostel.images.length > 0 ? (
                <img
                  src={expandedHostel.images[0]}
                  alt={expandedHostel.name}
                  className="w-full h-56 object-cover"
                />
              ) : (
                <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                  No photo
                </div>
              )}
              <button
                onClick={closeExpanded}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900">{expandedHostel.name}</h3>
              <p className="text-gray-500 text-sm mb-3">{expandedHostel.town}</p>
              <p className="text-gray-900 text-sm mb-4">
                <span className="font-semibold">GHC{expandedHostel.price}</span> / month
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/hostel/${expandedHostel.id}`}
                  className="flex-1 bg-[#1E88E5] text-white text-center text-sm font-semibold py-2.5 rounded-full hover:bg-[#1565C0] transition-colors"
                >
                  View listing
                </Link>
                <button
                  onClick={() => removeOne(expandedHostel.id)}
                  className="px-4 py-2.5 rounded-full border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}