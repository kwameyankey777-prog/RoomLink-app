"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "bartholomewkwameyankey@gmail.com";

export default function AdminPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/");
        return;
      }
      setCheckingAuth(false);
    }
    checkAccess();
  }, [router]);

  useEffect(() => {
    async function loadHostels() {
      if (checkingAuth) return;
      setLoading(true);
      const { data } = await supabase
        .from("hostels")
        .select("*")
        .order("id", { ascending: false });
      setHostels(data || []);
      setLoading(false);
    }
    loadHostels();
  }, [checkingAuth]);

  async function handleAction(hostelId, newStatus) {
    setActionMessage(null);
    const { error } = await supabase
      .from("hostels")
      .update({ status: newStatus })
      .eq("id", hostelId);

    if (error) {
      setActionMessage({ type: "error", text: error.message });
      return;
    }

    setHostels((prev) =>
      prev.map((h) => (h.id === hostelId ? { ...h, status: newStatus } : h))
    );
    setActionMessage({ type: "success", text: `Listing ${newStatus}.` });
  }

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  const pending = hostels.filter((h) => h.status === "pending");
  const others = hostels.filter((h) => h.status !== "pending");

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  function HostelCard({ hostel }) {
    return (
      <div className="border border-gray-200 rounded-xl p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="font-semibold text-gray-900">{hostel.name}</p>
            <p className="text-sm text-gray-500">{hostel.town} · {hostel.address}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyles[hostel.status] || "bg-gray-100 text-gray-600"}`}>
            {hostel.status}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-1">{hostel.description}</p>
        <p className="text-sm text-gray-700 mb-3">
          GHC{hostel.price}/mo · {hostel.type} · Capacity: {hostel.capacity || "N/A"}
        </p>

        {hostel.status === "pending" && (
          <div className="flex gap-3">
            <button
              onClick={() => handleAction(hostel.id, "approved")}
              className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => handleAction(hostel.id, "rejected")}
              className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin — Listing Review</h1>
        <p className="text-gray-500 mb-8">Approve or reject new hostel submissions.</p>

        {actionMessage && (
          <p className={`text-sm mb-4 ${actionMessage.type === "error" ? "text-red-600" : "text-green-600"}`}>
            {actionMessage.text}
          </p>
        )}

        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-gray-400 text-sm mb-8">No pending listings.</p>
        ) : (
          <div className="space-y-4 mb-10">
            {pending.map((h) => <HostelCard key={h.id} hostel={h} />)}
          </div>
        )}

        <h2 className="text-lg font-semibold text-gray-900 mb-3">All Other Listings</h2>
        <div className="space-y-4">
          {others.map((h) => <HostelCard key={h.id} hostel={h} />)}
        </div>
      </div>
    </div>
  );
}