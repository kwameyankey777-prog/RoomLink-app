"use client";

import { useState } from "react";
import Link from "next/link";

export default function HostelGrid({ hostels, reviews }) {
  const [capacityFilter, setCapacityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHostels = hostels?.filter((h) => {
    const matchesCapacity = capacityFilter ? String(h.capacity) === capacityFilter : true;
    const matchesType = typeFilter ? h.type === typeFilter : true;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query
      ? (h.name || "").toLowerCase().includes(query) ||
        (h.town || "").toLowerCase().includes(query) ||
        (h.address || "").toLowerCase().includes(query)
      : true;
    return matchesCapacity && matchesType && matchesSearch;
  });

  return (
    <>
      <div className="mb-8">
        <div className="relative max-w-xl mx-auto mb-5">
          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2"
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Start your search"
            className="w-full bg-white border border-gray-200 rounded-full pl-12 pr-5 py-4 text-gray-900 shadow-sm hover:shadow-md focus:outline-none focus:border-[#1E88E5] transition-shadow text-[15px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            {[
              { value: "", label: "All" },
              { value: "hostel", label: "Hostels" },
              { value: "apartment", label: "Apartments" },
            ].map((opt) => (
              <button
                key={opt.value || "all"}
                onClick={() => setTypeFilter(opt.value)}
                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  typeFilter === opt.value
                    ? "bg-[#1E88E5] text-white border-[#1E88E5]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 flex-wrap justify-center">
            {["", "1", "2", "3", "4", "5", "6"].map((val) => (
              <button
                key={val || "any"}
                onClick={() => setCapacityFilter(val)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  capacityFilter === val
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {val === "" ? "Any size" : `${val} ${val === "1" ? "person" : "people"}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredHostels && filteredHostels.length === 0 && (
        <p className="text-center text-gray-500">No listings match your search.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {filteredHostels?.map((hostel) => {
          const hostelReviews = reviews?.filter((r) => r.hostel_id === hostel.id) || [];
          const avgRating = hostelReviews.length
            ? (hostelReviews.reduce((sum, r) => sum + r.rating, 0) / hostelReviews.length)
            : null;
          const isGuestFavourite = avgRating && avgRating >= 4.8 && hostelReviews.length >= 3;

          return (
            <Link key={hostel.id} href={`/hostel/${hostel.id}`} className="group block">
              <div className="relative rounded-2xl overflow-hidden mb-3">
                {hostel.images && hostel.images.length > 0 ? (
                  <img
                    src={hostel.images[0]}
                    alt={hostel.name}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    No photo yet
                  </div>
                )}

                {isGuestFavourite && (
                  <span className="absolute top-3 left-3 bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                    Guest favourite
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-gray-900 text-[15px] leading-tight">{hostel.name}</p>
                {avgRating && (
                  <span className="flex items-center gap-1 text-[15px] text-gray-900 shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#1E88E5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" /></svg>
                    {avgRating.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">{hostel.town}</p>
              {hostel.capacity && (
                <p className="text-gray-500 text-sm">
                  {hostel.type === "apartment"
                    ? `${hostel.capacity} bedroom${hostel.capacity > 1 ? "s" : ""}`
                    : `${hostel.capacity} per room`}
                </p>
              )}
              <p className="text-gray-900 text-sm mt-1">
                <span className="font-semibold">GHC{hostel.price}</span> / month
              </p>
            </Link>
          );
        })}
      </div>
    </>
  );
}