"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import LegalContent from "../LegalContent";
const MenuIcons = {
  language: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  settings: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  bookings: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  ),
  listings: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  ),
  reviews: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  help: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  legal: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  ),
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(searchParams.get("tab") || "profile");

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  const [myListings, setMyListings] = useState([]);
  const [myListingsLoading, setMyListingsLoading] = useState(true);
  const [newImageFiles, setNewImageFiles] = useState({});
  const [listingMessage, setListingMessage] = useState(null);
  const [editingListingId, setEditingListingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [deletingListingId, setDeletingListingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [myReviews, setMyReviews] = useState([]);
  const [myReviewsLoading, setMyReviewsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/student");
        return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setAvatarUrl(data.avatar_url || null);
      }
      setEmail(user.email || "");
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  useEffect(() => {
    async function loadMyListings() {
      if (!profile || profile.role !== "owner") return;
      setMyListingsLoading(true);
      const { data } = await supabase
        .from("hostels")
        .select("*")
        .eq("owner_id", profile.id)
        .order("id", { ascending: false });
      setMyListings(data || []);
      setMyListingsLoading(false);
    }
    loadMyListings();
  }, [profile]);

  useEffect(() => {
    async function loadMyReviews() {
      if (!profile || profile.role !== "student") return;
      setMyReviewsLoading(true);
      const { data } = await supabase
        .from("reviews")
        .select("*, hostels(name)")
        .eq("student_id", profile.id)
        .order("id", { ascending: false });
      setMyReviews(data || []);
      setMyReviewsLoading(false);
    }
    loadMyReviews();
  }, [profile]);

  useEffect(() => {
    async function loadBookings() {
      if (!profile) return;
      setBookingsLoading(true);

      if (profile.role === "student") {
        const { data } = await supabase
          .from("bookings")
          .select("*, hostels(name, town, price)")
          .eq("student_id", profile.id)
          .order("id", { ascending: false });
        setBookings(data || []);
      } else if (profile.role === "owner") {
        const { data: ownedHostels } = await supabase
          .from("hostels")
          .select("id")
          .eq("owner_id", profile.id);

        const hostelIds = (ownedHostels || []).map((h) => h.id);

        if (hostelIds.length > 0) {
          const { data } = await supabase
            .from("bookings")
            .select("*, hostels(name, town, price)")
            .in("hostel_id", hostelIds)
            .order("id", { ascending: false });
          setBookings(data || []);
        } else {
          setBookings([]);
        }
      }
      setBookingsLoading(false);
    }
    loadBookings();
  }, [profile]);

  async function handleBookingAction(bookingId, newStatus) {
    setActionMessage(null);
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", bookingId);

    if (error) {
      setActionMessage({ type: "error", text: error.message });
      return;
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
    setActionMessage({ type: "success", text: `Request ${newStatus}.` });

    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      const { data: studentProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", booking.student_id)
        .single();

      if (studentProfile?.email) {
        fetch("/api/send-booking-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: newStatus === "accepted" ? "accepted" : "declined",
            to: studentProfile.email,
            hostelName: booking.hostels?.name,
            studentName: studentProfile.full_name,
          }),
        }).catch((err) => console.error("Email send failed:", err));
      }
    }
  }

  function handleNewImageChange(hostelId, e) {
    setNewImageFiles((prev) => ({ ...prev, [hostelId]: Array.from(e.target.files) }));
  }

  async function handleAddImages(hostelId) {
    const files = newImageFiles[hostelId];
    if (!files || files.length === 0) return;

    const listing = myListings.find((l) => l.id === hostelId);
    const currentCount = (listing.images || []).length;

    if (currentCount + files.length > 7) {
      setListingMessage({
        type: "error",
        text: `This listing already has ${currentCount} photo(s). You can add up to ${7 - currentCount} more (max 7 total).`,
      });
      return;
    }

    setListingMessage(null);
    const { data: { user } } = await supabase.auth.getUser();
    const uploadedUrls = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("hostel-images")
        .upload(fileName, file);

      if (uploadError) {
        setListingMessage({ type: "error", text: uploadError.message });
        return;
      }

      const { data: urlData } = supabase.storage.from("hostel-images").getPublicUrl(fileName);
      uploadedUrls.push(urlData.publicUrl);
    }

    const updatedImages = [...(listing.images || []), ...uploadedUrls];

    const { error } = await supabase
      .from("hostels")
      .update({ images: updatedImages })
      .eq("id", hostelId);

    if (error) {
      setListingMessage({ type: "error", text: error.message });
      return;
    }

    setMyListings((prev) =>
      prev.map((l) => (l.id === hostelId ? { ...l, images: updatedImages } : l))
    );
    setNewImageFiles((prev) => ({ ...prev, [hostelId]: [] }));
    setListingMessage({ type: "success", text: "Photos added." });
  }

  async function handleDeleteImage(hostelId, imageUrl) {
    setListingMessage(null);
    const listing = myListings.find((l) => l.id === hostelId);
    const updatedImages = (listing.images || []).filter((url) => url !== imageUrl);

    const { error } = await supabase
      .from("hostels")
      .update({ images: updatedImages })
      .eq("id", hostelId);

    if (error) {
      setListingMessage({ type: "error", text: error.message });
      return;
    }

    const fileName = imageUrl.split("/hostel-images/")[1];
    if (fileName) {
      await supabase.storage.from("hostel-images").remove([fileName]);
    }

    setMyListings((prev) =>
      prev.map((l) => (l.id === hostelId ? { ...l, images: updatedImages } : l))
    );
    setListingMessage({ type: "success", text: "Photo removed." });
  }

  function startEditName(listing) {
    setEditingListingId(listing.id);
    setEditName(listing.name);
    setListingMessage(null);
  }

  async function handleSaveName(hostelId) {
    if (!editName.trim()) {
      setListingMessage({ type: "error", text: "Name cannot be empty." });
      return;
    }
    setSavingName(true);
    const { error } = await supabase
      .from("hostels")
      .update({ name: editName.trim() })
      .eq("id", hostelId);

    setSavingName(false);
    if (error) {
      setListingMessage({ type: "error", text: error.message });
      return;
    }

    setMyListings((prev) =>
      prev.map((l) => (l.id === hostelId ? { ...l, name: editName.trim() } : l))
    );
    setEditingListingId(null);
    setListingMessage({ type: "success", text: "Name updated." });
  }

  async function handleDeleteListing(hostelId) {
    setDeletingListingId(hostelId);
    setListingMessage(null);

    const listing = myListings.find((l) => l.id === hostelId);
    if (listing?.images?.length) {
      const fileNames = listing.images
        .map((url) => url.split("/hostel-images/")[1])
        .filter(Boolean);
      if (fileNames.length) {
        await supabase.storage.from("hostel-images").remove(fileNames);
      }
    }

    const { data, error } = await supabase.from("hostels").delete().eq("id", hostelId).select();
    console.log("Delete result:", data, error);

    setDeletingListingId(null);
    setConfirmDeleteId(null);

    if (error) {
      setListingMessage({ type: "error", text: error.message });
      return;
    }

    setMyListings((prev) => prev.filter((l) => l.id !== hostelId));
    setListingMessage({ type: "success", text: "Listing deleted." });
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${profile.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      setUploadingAvatar(false);
      setMessage({ type: "error", text: uploadError.message });
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const newAvatarUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: newAvatarUrl })
      .eq("id", profile.id);

    setUploadingAvatar(false);
    if (updateError) {
      setMessage({ type: "error", text: updateError.message });
      return;
    }

    setAvatarUrl(newAvatarUrl);
  }

  async function handleSaveAccount(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", profile.id);

    const authUpdates = {};
    if (email && email !== profile.email) authUpdates.email = email;
    if (newPassword) authUpdates.password = newPassword;

    let authError = null;
    if (Object.keys(authUpdates).length > 0) {
      const { error } = await supabase.auth.updateUser(authUpdates);
      authError = error;
    }

    setSaving(false);
    if (profileError || authError) {
      setMessage({ type: "error", text: profileError?.message || authError?.message });
    } else {
      setMessage({ type: "success", text: "Account updated successfully." });
      setNewPassword("");
    }
  }

  const languages = [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
    { code: "pt", label: "Português" },
    { code: "ar", label: "العربية" },
    { code: "sw", label: "Kiswahili" },
    { code: "ha", label: "Hausa" },
    { code: "yo", label: "Yorùbá" },
    { code: "ig", label: "Igbo" },
    { code: "zh-CN", label: "中文" },
    { code: "hi", label: "हिन्दी" },
    { code: "de", label: "Deutsch" },
  ];

  function changeLanguage(code) {
    if (code === "en") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } else {
      document.cookie = `googtrans=/en/${code}; path=/;`;
    }
    window.location.reload();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login/student");
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : "";

  const menuItems = [
    { id: "settings", title: "Account Settings", subtitle: "Name, phone, email, password" },
    { id: "language", title: "Language", subtitle: "Translate the app" },
    { id: "bookings", title: profile?.role === "owner" ? "Booking Requests" : "My Bookings", subtitle: "Track your reservations" },
    ...(profile?.role === "owner" ? [{ id: "listings", title: "My Listings", subtitle: "Manage your properties & photos" }] : []),
    ...(profile?.role === "student" ? [{ id: "reviews", title: "Reviews & Contributions", subtitle: `${myReviews.length} review${myReviews.length !== 1 ? "s" : ""} written` }] : []),
    { id: "help", title: "Help Center", subtitle: "Support, FAQs" },
    { id: "legal", title: "Privacy & Legal", subtitle: "Policies & terms" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-6 py-10">
        {view === "profile" ? (
          <>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-[#1E88E5] text-white flex items-center justify-center text-3xl font-bold overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    fullName ? fullName.charAt(0).toUpperCase() : "?"
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  {uploadingAvatar ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#1E88E5] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xl font-bold text-gray-900">{fullName || email}</p>
              {memberSince && <p className="text-gray-500 text-sm">Member since {memberSince}</p>}
              <span className="text-xs uppercase tracking-wider text-[#1E88E5] mt-1">{profile?.role === "owner" ? "Host" : "Occupant"}</span>
            </div>

            <div className="space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className="w-full flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-[#1E88E5] transition-colors"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 shrink-0">{MenuIcons[item.id]}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.subtitle}</p>
                  </div>
                  <span className="text-gray-300">›</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSignOut}
              className="w-full mt-6 mb-24 bg-[#1E88E5] text-white font-semibold rounded-xl py-3 hover:bg-[#1565C0] transition-colors"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setView("profile")}
              className="text-[#1E88E5] text-sm font-medium mb-6 flex items-center gap-1"
            >
              ‹ Back to Profile
            </button>

            {view === "bookings" && (
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {profile?.role === "owner" ? "Booking Requests" : "My Bookings"}
                </h1>
                <p className="text-gray-500 mb-6">
                  {profile?.role === "owner"
                    ? "Requests from students for your listings."
                    : "Your reservation requests and their status."}
                </p>

                {actionMessage && (
                  <p className={`text-sm mb-4 ${actionMessage.type === "error" ? "text-red-600" : "text-green-600"}`}>
                    {actionMessage.text}
                  </p>
                )}

                {bookingsLoading ? (
                  <p className="text-gray-400 text-sm">Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    {profile?.role === "owner" ? "No booking requests yet." : "You haven't made any booking requests yet."}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border border-gray-200 rounded-xl p-5 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{booking.hostels?.name || "Listing"}</p>
                            <p className="text-sm text-gray-500">{booking.hostels?.town}</p>
                          </div>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyles[booking.status] || "bg-gray-100 text-gray-600"}`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Room type:</span> {booking.room_type}
                        </p>
                        {booking.message && (
                          <p className="text-sm text-gray-600 mb-3">
                            <span className="font-medium">Message:</span> {booking.message}
                          </p>
                        )}

                        {profile?.role === "owner" && booking.status === "pending" && (
                          <div className="flex gap-3 mt-3">
                            <button
                              onClick={() => handleBookingAction(booking.id, "accepted")}
                              className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleBookingAction(booking.id, "declined")}
                              className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {profile?.role === "student" && booking.status === "accepted" && (
                          <p className="text-sm text-green-700 mt-2">
                            Your request was accepted! Contact the owner to complete payment.
                          </p>
                        )}
                        {profile?.role === "student" && booking.status === "declined" && (
                          <p className="text-sm text-red-600 mt-2">This request was declined by the owner.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === "listings" && (
              <div>
                <h1 className="text-2xl font-bold mb-2">My Listings</h1>
                <p className="text-gray-500 mb-6">Manage your properties and photos.</p>

                {listingMessage && (
                  <p className={`text-sm mb-4 ${listingMessage.type === "error" ? "text-red-600" : "text-green-600"}`}>
                    {listingMessage.text}
                  </p>
                )}

                {myListingsLoading ? (
                  <p className="text-gray-400 text-sm">Loading...</p>
                ) : myListings.length === 0 ? (
                  <p className="text-gray-400 text-sm">You haven't listed any properties yet.</p>
                ) : (
                  <div className="space-y-6">
                    {myListings.map((listing) => (
                      <div key={listing.id} className="border border-gray-200 rounded-xl p-5 bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            {editingListingId === listing.id ? (
                              <div className="flex items-center gap-2 mb-1">
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-[#1E88E5]"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveName(listing.id)}
                                  disabled={savingName}
                                  className="text-xs font-semibold text-white bg-[#1E88E5] px-3 py-1.5 rounded-lg hover:bg-[#1565C0] disabled:opacity-50"
                                >
                                  {savingName ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={() => setEditingListingId(null)}
                                  className="text-xs font-semibold text-gray-500 px-2"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900">{listing.name}</p>
                                <button
                                  onClick={() => startEditName(listing)}
                                  className="text-gray-400 hover:text-[#1E88E5]"
                                  aria-label="Edit name"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                            <p className="text-sm text-gray-500">{listing.town}</p>
                          </div>
                          <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize bg-gray-100 text-gray-600 shrink-0">
                            {listing.status}
                          </span>
                        </div>

                        {listing.images && listing.images.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto mb-4">
                            {listing.images.map((url) => (
                              <div key={url} className="relative flex-shrink-0">
                                <img src={url} alt="" className="w-24 h-24 object-cover rounded-lg" />
                                <button
                                  onClick={() => handleDeleteImage(listing.id, url)}
                                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-700"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 mb-4">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleNewImageChange(listing.id, e)}
                            className="text-sm"
                          />
                          <button
                            onClick={() => handleAddImages(listing.id)}
                            className="bg-[#1E88E5] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1565C0] transition-colors"
                          >
                            Add Photos
                          </button>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                          {confirmDeleteId === listing.id ? (
                            <div className="flex items-center gap-3">
                              <p className="text-sm text-gray-700">Delete this listing permanently?</p>
                              <button
                                onClick={() => handleDeleteListing(listing.id)}
                                disabled={deletingListingId === listing.id}
                                className="text-xs font-semibold text-white bg-red-600 px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                              >
                                {deletingListingId === listing.id ? "Deleting..." : "Yes, delete"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-xs font-semibold text-gray-500 px-2"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(listing.id)}
                              className="text-sm font-semibold text-red-600 hover:text-red-700"
                            >
                              Delete listing
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === "language" && (
              <div>
                <h1 className="text-2xl font-bold mb-2">Language</h1>
                <p className="text-gray-500 mb-6">Choose a language to translate the app. Powered by Google Translate.</p>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-left hover:border-[#1E88E5] transition-colors"
                    >
                      <span className="font-medium text-gray-900">{lang.label}</span>
                      <span className="text-gray-300">›</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {view === "settings" && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
                <form onSubmit={handleSaveAccount} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1E88E5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1E88E5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1E88E5]"
                    />
                    <p className="text-xs text-gray-400 mt-1">Changing this may require confirming the new email.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1E88E5]"
                    />
                  </div>

                  {message && (
                    <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
                      {message.text}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#1E88E5] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#1565C0] transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>
            )}

            {view === "reviews" && (
              <div>
                <h1 className="text-2xl font-bold mb-2">Reviews & Contributions</h1>
                <p className="text-gray-500 mb-6">Reviews you've written for hostels.</p>

                {myReviewsLoading ? (
                  <p className="text-gray-400 text-sm">Loading...</p>
                ) : myReviews.length === 0 ? (
                  <p className="text-gray-400 text-sm">You haven't written any reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {myReviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-xl p-5 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">{review.hostels?.name || "Listing"}</p>
                          <p className="text-sm text-[#1E88E5]">{"★".repeat(review.rating)}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                        {review.owner_reply && (
                          <div className="bg-gray-50 rounded-lg p-3 mt-2">
                            <p className="text-xs text-[#1E88E5] mb-1">Owner reply</p>
                            <p className="text-sm text-gray-600">{review.owner_reply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === "help" && (
              <div>
                <h1 className="text-2xl font-bold mb-4">Get Help</h1>
                <p className="text-gray-500 mb-4">
                  Need assistance? Reach out to our support team and we'll get back to you as soon as possible.
                </p>
              <p className="text-sm text-gray-700">
                  Email: <a href="mailto:HnAlink20@gmail.com" className="text-[#1E88E5]">HnAlink20@gmail.com</a>
                </p>
              </div>
            )}

            {view === "legal" && (
              <div>
                <h1 className="text-2xl font-bold mb-4">Privacy & Legal</h1>
                <LegalContent />
              </div>
            )}
          </>
        )}
     </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}