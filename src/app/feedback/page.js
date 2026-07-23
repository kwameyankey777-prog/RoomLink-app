"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function FeedbackPage() {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("You must be logged in to send feedback.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("feedback").insert([{
      user_id: user.id,
      rating,
      message: message.trim() || null,
    }]);

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
    } else {
      setSubmitted(true);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-6 pt-10 pb-32">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-[#1E88E5] text-sm font-medium mb-6 flex items-center gap-1"
        >
          ‹ Back to Profile
        </button>

        {submitted ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Thanks for the feedback!</h1>
            <p className="text-gray-500 mb-8">It genuinely helps us improve HnAlink.</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-[#1E88E5] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#1565C0] transition-colors"
            >
              Back to Profile
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Send Feedback</h1>
            <p className="text-gray-500 mb-8">
              Tell us what&apos;s working, what&apos;s not, or what you&apos;d like to see next.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How&apos;s your experience with HnAlink so far?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-3xl transition-transform hover:scale-110"
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    >
                      <span className={(hoverRating || rating) >= star ? "text-[#1E88E5]" : "text-gray-200"}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your thoughts (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="What do you like? What could be better?"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#1E88E5] placeholder-gray-300"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1E88E5] text-white font-semibold rounded-xl py-4 hover:bg-[#1565C0] transition-colors disabled:opacity-50 text-lg"
              >
                {submitting ? "Sending..." : "Send Feedback"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}