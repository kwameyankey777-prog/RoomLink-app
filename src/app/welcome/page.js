"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WelcomePage() {
  const router = useRouter();
  const [confirmChoice, setConfirmChoice] = useState(null);

  function handleConfirm() {
    if (confirmChoice === "student") {
      router.push("/login/student");
    } else if (confirmChoice === "owner") {
      router.push("/login/owner");
    }
    setConfirmChoice(null);
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <img src="/logo.png" alt="HnAlink" className="h-16 w-16 rounded-2xl mb-6" />
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
        Find your next place<br />
        to <span className="text-[#1E88E5]">call home</span>
      </h1>
      <p className="text-gray-500 max-w-sm mb-10 text-lg">
        Hostels and apartments near campus, reviewed by occupants.
      </p>

      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => setConfirmChoice("student")}
          className="block w-full bg-[#1E88E5] text-white font-semibold rounded-xl py-4 hover:bg-[#1565C0] transition-colors text-lg"
        >
          I&apos;m looking for a place
        </button>
        <button
          onClick={() => setConfirmChoice("owner")}
          className="block w-full bg-white border border-gray-300 text-gray-900 font-semibold rounded-xl py-4 hover:border-gray-400 transition-colors text-lg"
        >
          I have a place to list
        </button>
      </div>

      <p className="text-gray-400 text-sm mt-8">
        New here?{" "}
        <Link href="/signup/student" className="text-[#1E88E5] hover:underline">
          Sign up as an occupant
        </Link>{" "}
        or{" "}
        <Link href="/signup/owner" className="text-[#1E88E5] hover:underline">
          as a host
        </Link>
      </p>

      {confirmChoice && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50"
          onClick={() => setConfirmChoice(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmChoice === "student"
                ? "Continue as someone looking for a place?"
                : "Continue as a host listing a place?"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {confirmChoice === "student"
                ? "You&apos;ll be taken to the occupant login."
                : "You&apos;ll be taken to the host login."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmChoice(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-[#1E88E5] text-white font-semibold rounded-lg py-2.5 hover:bg-[#1565C0] transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}