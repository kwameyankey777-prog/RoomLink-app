"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      setValidSession(!!session);
      setCheckingSession(false);
    }
    checkSession();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/"), 2000);
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="text-[#1E88E5] font-bold text-xl block mb-8">RoomLink</Link>

        {!validSession ? (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Link expired</h1>
            <p className="text-gray-500 mb-8">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link href="/forgot-password" className="text-[#1E88E5] hover:underline text-sm">
              ‹ Request a new link
            </Link>
          </div>
        ) : done ? (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Password updated</h1>
            <p className="text-gray-500 mb-8">Redirecting you home...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Set a new password</h1>
            <p className="text-gray-500 mb-8">Choose a new password for your account.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#1E88E5]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#1E88E5]"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1E88E5] text-white font-semibold rounded-lg py-3 hover:bg-[#1565c0] transition-colors disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}