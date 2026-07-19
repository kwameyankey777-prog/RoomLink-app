"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "bartholomewkwameyankey@gmail.com";

export default function AdminPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [hostels, setHostels] = useState([]);
  const [owners, setOwners] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

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

      const ownerIds = [...new Set((data || []).map((h) => h.owner_id).filter(Boolean))];
      if (ownerIds.length > 0) {
        const { data: ownerData } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone")
          .in("id", ownerIds);
        const map = {};
        (ownerData || []).forEach((o) => { map[o.id] = o; });
        setOwners(map);
      }

      setLoading(false);
    }
    loadHostels();
  }, [checkingAuth]);

  async function handleAction(hostelId, newStatus, reason) {
    setSubmittingAction(true);
    setActionMessage(null);

    const updates = { status: newStatus };
    if (newStatus === "rejected") {
      updates.rejection_reason = reason || null;
    }

    const { data, error } = await supabase
      .from("hostels")
      .update(updates)
      .eq("id", hostelId)
      .select();

    setSubmittingAction(false);
    setConfirmAction(null);
    setRejectReason("");

    if (error || !data || data.length === 0) {
      setActionMessage({ type: "error", text: error?.message || "Update failed. Nothing changed." });
      return;
    }

    setHostels((prev) =>
      prev.map((h) => (h.id === hostelId ? { ...h, status: newStatus, rejection_reason: updates.rejection_reason } : h))
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

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const counts = {
    pending: hostels.filter((h) => h.status === "pending").length,
    approved: hostels.filter((h) => h.status === "approved").length,
    rejected: hostels.filter((h) => h.status === "rejected").length,
    all: hostels.length,
  };

  const query = searchQuery.trim().toLowerCase();
  const visibleHostels = hostels.filter((h) => {
    const matchesStatus = statusFilter === "all" ? true : h.status === statusFilter;
    const matchesSearch = query
      ? (h.name || "").toLowerCase().includes(query) || (h.town || "").toLowerCase().includes(query)
      : true;
    return matchesStatus && matchesSearch;
  });

  function HostelCard({ hostel }) {
    const owner = owners[hostel.owner_id];
    return (
      <div className="border border-gray-200 rounded-xl p-5 bg-white">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold text-gray-900">{hostel.name}</p>
            <p className="text-sm text-gray-500">{hostel.town} · {hostel.address}</p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize shrink-0 ${statusStyles[hostel.status] || "bg-gray-100 text-gray-600"}`}>
            {hostel.status}
          </span>
        </div>

        {hostel.images && hostel.images.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto mb-3">
            {hostel.images.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                onClick={() => setPreviewImage(url)}
                className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity shrink-0"
              />
            ))}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
            <p className="text-amber-700 text-xs font-medium">No photos uploaded — review carefully before approving.</p>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-1">{hostel.description}</p>
        <p className="text-sm text-gray-700 mb-3">
          GHC{hostel.price}/mo · {hostel.type} · Capacity: {hostel.capacity || "N/A"}
        </p>

        {owner && (
          <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs font-semibold text-gray-500 mb-0.5">Host</p>
            <p className="text-sm text-gray-800">{owner.full_name || "Unnamed"}</p>
            <p className="text-xs text-gray-500">{owner.email} {owner.phone ? `· ${owner.phone}` : ""}</p>
          </div>
        )}

        {hostel.status === "rejected" && hostel.rejection_reason && (
          <div className="bg-red-50 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs font-semibold text-red-500 mb-0.5">Rejection reason</p>
            <p className="text-sm text-red-700">{hostel.rejection_reason}</p>
          </div>
        )}

        <div className="flex gap-3">
          {hostel.status !== "approved" && (
            <button
              onClick={() => setConfirmAction({ hostelId: hostel.id, newStatus: "approved", name: hostel.name })}
              className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
          )}
          {hostel.status !== "rejected" && (
            <button
              onClick={() => setConfirmAction({ hostelId: hostel.id, newStatus: "rejected", name: hostel.name })}
              className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          )}
          {hostel.status !== "pending" && (
            <button
              onClick={() => setConfirmAction({ hostelId: hostel.id, newStatus: "pending", name: hostel.name })}
              className="text-gray-500 text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Reset to pending
            </button>
          )}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "all", label: "All" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 pb-40">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin — Listing Review</h1>
        <p className="text-gray-500 mb-6">Approve or reject hostel and apartment submissions.</p>

        {actionMessage && (
          <p className={`text-sm mb-4 ${actionMessage.type === "error" ? "text-red-600" : "text-green-600"}`}>
            {actionMessage.text}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setStatusFilter(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                statusFilter === t.id
                  ? "bg-[#1E88E5] text-white border-[#1E88E5]"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              {t.label} ({counts[t.id]})
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or town..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-6 focus:outline-none focus:border-[#1E88E5]"
        />

        {visibleHostels.length === 0 ? (
          <p className="text-gray-400 text-sm">No listings match this filter.</p>
        ) : (
          <div className="space-y-4">
            {visibleHostels.map((h) => <HostelCard key={h.id} hostel={h} />)}
          </div>
        )}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80"
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} alt="" className="max-w-full max-h-full rounded-lg" />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-gray-900"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}

      {confirmAction && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50"
          onClick={() => !submittingAction && setConfirmAction(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2 capitalize">
              {confirmAction.newStatus} &quot;{confirmAction.name}&quot;?
            </h3>

            {confirmAction.newStatus === "rejected" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional, shown to host)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Photos unclear, missing address details..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1E88E5]"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={submittingAction}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(confirmAction.hostelId, confirmAction.newStatus, rejectReason)}
                disabled={submittingAction}
                className="flex-1 bg-[#1E88E5] text-white font-semibold rounded-lg py-2.5 hover:bg-[#1565C0] transition-colors disabled:opacity-50"
              >
                {submittingAction ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}