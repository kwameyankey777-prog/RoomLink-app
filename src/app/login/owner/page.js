"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OwnerLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email, password: form.password,
    });
    setSubmitting(false);
    if (signInError) { setError(signInError.message); return; }
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="text-[#1E88E5] font-bold text-xl block mb-8">HnAlink</Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-gray-500 mb-8">Log in to manage your listings and respond to bookings.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#1E88E5]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-[#1E88E5]" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full bg-[#1E88E5] text-white font-semibold rounded-lg py-3 hover:bg-[#1565c0] transition-colors disabled:opacity-50">
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="text-gray-500 text-sm mt-6 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup/owner" className="text-[#1E88E5] hover:underline">Sign up</Link>
        </p>
      </div>
    </main>
  );
}