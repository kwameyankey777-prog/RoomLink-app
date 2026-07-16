"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setSubmitting(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="text-[#1E88E5] font-bold text-xl block mb-8">RoomLink</Link>

        {sent ? (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Check your email</h1>
            <p className="text-gray-500 mb-8">
              If an account exists for {email}, we've sent a link to reset your password.
            </p>
            <Link href="/login/student" className="text-[#1E88E5] hover:underline text-sm">
              ‹ Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h1>
            <p className="text-gray-500 mb-8">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#1E88E5]"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1E88E5] text-white font-semibold rounded-lg py-3 hover:bg-[#1565c0] transition-colors disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <p className="text-gray-500 text-sm mt-6 text-center">
              <Link href="/login/student" className="text-[#1E88E5] hover:underline">‹ Back to login</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}