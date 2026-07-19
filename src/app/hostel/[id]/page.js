"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HostelDetail({ params }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [hostel, setHostel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownerProfile, setOwnerProfile] = useState(null);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [bookingForm, setBookingForm] = useState({ room_type: "Single room", message: "" });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  function nextImage() {
    setCurrentImageIndex((prev) => (prev + 1) % hostel.images.length);
  }

  function prevImage() {
    setCurrentImageIndex((prev) => (prev - 1 + hostel.images.length) % hostel.images.length);
  }

  useEffect(() => {
    async function load() {
      const { id } = await params;
      const { data: hostelData } = await supabase.from("hostels").select("*").eq("id", id).single();

      if (hostelData) {
        try {
          const recent = JSON.parse(localStorage.getItem("roomlink_recent") || "[]");
          const filtered = recent.filter((r) => r !== id);
          filtered.unshift(id);
          localStorage.setItem("roomlink_recent", JSON.stringify(filtered.slice(0, 10)));
        } catch (e) {
          console.error("Failed to save recently viewed:", e);
        }
      }

      const { data: reviewData } = await supabase.from("reviews").select("*").eq("hostel_id", id).eq("status", "approved");

      const reviewerIds = [...new Set((reviewData || []).map((r) => r.student_id).filter(Boolean))];
      let reviewerAvatars = {};
      if (reviewerIds.length > 0) {
        const { data: reviewerProfiles } = await supabase
          .from("profiles")
          .select("id, avatar_url")
          .in("id", reviewerIds);
        (reviewerProfiles || []).forEach((p) => { reviewerAvatars[p.id] = p.avatar_url; });
      }
      const reviewsWithAvatars = (reviewData || []).map((r) => ({
        ...r,
        avatar_url: reviewerAvatars[r.student_id] || null,
      }));

      setHostel(hostelData);
      setReviews(reviewsWithAvatars);
      if (hostelData?.owner_id) {
        const { data: ownerData } = await supabase.from("profiles").select("full_name, phone, email").eq("id", hostelData.owner_id).single();
        setOwnerProfile(ownerData);
      }
      setLoading(false);
    }
    load();
  }, [params]);

  function handleReviewChange(e) { setReviewForm({ ...reviewForm, [e.target.name]: e.target.value }); }
  function handleBookingChange(e) { setBookingForm({ ...bookingForm, [e.target.name]: e.target.value }); }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!user || profile?.role !== "student") return;
    setReviewSubmitting(true);
    setReviewError(null);
    const { id } = await params;
    const { error } = await supabase.from("reviews").insert([{
      hostel_id: id,
      student_id: user.id,
      student_name: profile.full_name || "Student",
      rating: parseFloat(reviewForm.rating), comment: reviewForm.comment, status: "approved",
    }]);
    setReviewSubmitting(false);
    if (error) { setReviewError(error.message); }
    else { setReviewSubmitted(true); setReviewForm({ rating: 5, comment: "" }); router.refresh(); }
  }

  async function handleBookingSubmit(e) {
    e.preventDefault();
    if (!user) return;
    if (hostel?.available === false) return;
    setBookingSubmitting(true);
    setBookingError(null);
    const { id } = await params;
    const { error } = await supabase.from("bookings").insert([{
      hostel_id: id, student_id: user.id,
      room_type: bookingForm.room_type, message: bookingForm.message, status: "pending",
    }]);
    setBookingSubmitting(false);
    if (error) {
      setBookingError(error.message);
    } else {
      setBookingSubmitted(true);
      setBookingForm({ room_type: "Single room", message: "" });

      if (ownerProfile?.email) {
        fetch("/api/send-booking-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "new_request",
            to: ownerProfile.email,
            hostelName: hostel.name,
            roomType: bookingForm.room_type,
            message: bookingForm.message,
          }),
        }).catch((err) => console.error("Email send failed:", err));
      }
    }
  }

  if (loading) return <main className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-500">Loading...</p></main>;
  if (!hostel) return <main className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-500">Hostel not found.</p></main>;

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const isUnavailable = hostel.available === false;

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="HnAlink" className="h-9 w-9 rounded-lg" />
          <span className="text-[#1E88E5] font-bold text-xl">HnAlink</span>
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 pb-28">
        <p className="text-gray-500 text-sm uppercase tracking-wider mb-2">{hostel.type}</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{hostel.name}</h1>
        {avgRating && (
          <p className="text-sm text-gray-600 mb-6">★ {avgRating} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        )}

        {isUnavailable && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-8 flex items-center gap-3">
            <span className="text-amber-500 text-lg">⚠</span>
            <div>
              <p className="text-amber-800 font-semibold text-sm">Currently unavailable</p>
              <p className="text-amber-700 text-sm">This listing isn't accepting new bookings right now.</p>
            </div>
          </div>
        )}

        {hostel.images && hostel.images.length > 0 ? (
          <div className="relative rounded-2xl overflow-hidden h-96 mb-10 bg-gray-100 select-none">
            <img
              src={hostel.images[currentImageIndex]}
              alt={hostel.name}
              className="w-full h-full object-cover"
            />
            {hostel.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full w-9 h-9 flex items-center justify-center shadow"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full w-9 h-9 flex items-center justify-center shadow"
                >
                  ›
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {hostel.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2 h-2 rounded-full ${
                        i === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center text-gray-400 mb-10">
            No photo yet
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">{hostel.town}</p>
            <p className="text-gray-700 mb-2">{hostel.address}</p>
            <p className="text-gray-700 mb-6">{hostel.description}</p>

            {hostel.capacity && (
              <div className="border-t border-gray-100 py-6">
                <p className="font-semibold text-gray-900 mb-1">
                  {hostel.type === "apartment" ? "Bedrooms" : "People per room"}
                </p>
                <p className="text-gray-500">{hostel.capacity}</p>
              </div>
            )}

            {ownerProfile && (
              <div className="border-t border-gray-100 py-6">
                <p className="font-semibold text-gray-900 mb-3">Contact Owner</p>
                <p className="text-gray-700 font-medium">{ownerProfile.full_name}</p>
                <p className="text-gray-500 mb-3">📞 {ownerProfile.phone}</p>
                {user && profile?.role === "student" && hostel.owner_id && (
                  <Link
                    href={`/messages?to=${hostel.owner_id}&hostel=${hostel.id}`}
                    className="inline-block bg-[#1E88E5] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1565C0] transition-colors"
                  >
                    Message Owner
                  </Link>
                )}
              </div>
            )}

            <div className="border-t border-gray-100 pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {reviews.length > 0 ? "★ " + avgRating + " · " + reviews.length + " reviews" : "No reviews yet"}
              </h2>
             {reviews.map((review) => (
                <div key={review.id} className="mb-6 pb-6 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#1E88E5] text-white flex items-center justify-center text-xs font-semibold overflow-hidden shrink-0">
                        {review.avatar_url ? (
                          <img src={review.avatar_url} alt={review.student_name} className="w-full h-full object-cover" />
                        ) : (
                          (review.student_name || "?").charAt(0).toUpperCase()
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">{review.student_name}</p>
                    </div>
                    <p className="text-gray-500 text-sm">{"★".repeat(review.rating)}</p>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                  {review.owner_reply && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Owner reply</p>
                      <p className="text-gray-600 text-sm">{review.owner_reply}</p>
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Leave a review</h3>
                {reviewSubmitted && <p className="text-green-600 text-sm mb-4">Thanks for your review!</p>}
                {!user || profile?.role !== "student" ? (
                  <p className="text-gray-500 text-sm">
                    <Link href="/login/student" className="text-[#1E88E5] hover:underline">Log in as a student</Link> to leave a review.
                  </p>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                      <input name="rating" type="number" min="1" max="5" value={reviewForm.rating} onChange={handleReviewChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1E88E5]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                      <textarea name="comment" value={reviewForm.comment} onChange={handleReviewChange} required rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1E88E5]" />
                    </div>
                    {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
                    <button type="submit" disabled={reviewSubmitting} className="bg-[#1E88E5] text-white font-semibold rounded-lg px-6 py-3 hover:bg-[#1565C0] transition-colors disabled:opacity-50">
                      {reviewSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-96">
            <div className="border border-gray-200 rounded-2xl p-6 shadow-lg sticky top-8">
              <p className="text-2xl font-bold text-gray-900 mb-1">
                GHC{hostel.price}<span className="text-base font-normal text-gray-500"> / month</span>
              </p>
              {avgRating && <p className="text-sm text-gray-500 mb-6">★ {avgRating} · {reviews.length} reviews</p>}

              {isUnavailable ? (
                <div className="text-center py-6">
                  <p className="text-amber-700 font-semibold text-lg mb-2">Not available</p>
                  <p className="text-gray-500 text-sm">This host has marked this listing as unavailable. Check back later.</p>
                </div>
              ) : profile?.role === "student" ? (
                bookingSubmitted ? (
                  <div className="text-center py-6">
                    <p className="text-green-600 font-semibold text-lg mb-2">Request sent!</p>
                    <p className="text-gray-500 text-sm">The host will be in touch soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                      <select name="room_type" value={bookingForm.room_type} onChange={handleBookingChange} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#1E88E5]">
                        <option>Single room</option>
                        <option>Shared room (2 people)</option>
                        <option>Shared room (3-4 people)</option>
                        <option>Entire apartment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message to owner (optional)</label>
                      <textarea name="message" value={bookingForm.message} onChange={handleBookingChange} rows={3} placeholder="Introduce yourself, mention move-in date..." className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#1E88E5] placeholder-gray-300" />
                    </div>
                    {bookingError && <p className="text-red-500 text-sm">{bookingError}</p>}
                    <button type="submit" disabled={bookingSubmitting} className="w-full bg-[#1E88E5] text-white font-semibold rounded-xl py-4 hover:bg-[#1565c0] transition-colors disabled:opacity-50 text-lg">
                      {bookingSubmitting ? "Sending..." : "Reserve"}
                    </button>
                  </form>
                )
              ) : (
                <div>
                 <p className="text-gray-500 text-sm mb-4 text-center">Log in as an occupant to reserve this place.</p>
                  <Link href="/login/student" className="block w-full bg-[#1E88E5] text-white font-semibold rounded-xl py-4 text-center hover:bg-[#1565c0] transition-colors text-lg">
                    Log in to Reserve
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}