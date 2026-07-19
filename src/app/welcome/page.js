"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const HOUSE_PATHS = [
  "M4 21V10l8-6 8 6v11h-5v-7h-6v7z",
];

function HouseIcon({ style, size }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1E88E5"
      strokeWidth="1"
      className="house-float"
      style={style}
    >
      <path d={HOUSE_PATHS[0]} />
    </svg>
  );
}

const houseLayout = [
  { top: "8%", left: "6%", size: 46, delay: "0s", duration: "7s" },
  { top: "18%", left: "82%", size: 34, delay: "1.2s", duration: "8s" },
  { top: "62%", left: "10%", size: 38, delay: "0.6s", duration: "6.5s" },
  { top: "72%", left: "78%", size: 50, delay: "1.8s", duration: "7.5s" },
  { top: "38%", left: "90%", size: 28, delay: "0.3s", duration: "9s" },
  { top: "48%", left: "2%", size: 30, delay: "2.1s", duration: "6.8s" },
  { top: "85%", left: "45%", size: 32, delay: "0.9s", duration: "7.2s" },
  { top: "5%", left: "45%", size: 26, delay: "1.5s", duration: "8.3s" },
];

export default function WelcomePage() {
  const router = useRouter();
  const [confirmChoice, setConfirmChoice] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  function handleConfirm() {
    if (confirmChoice === "student") {
      router.push("/login/student");
    } else if (confirmChoice === "owner") {
      router.push("/login/owner");
    }
    setConfirmChoice(null);
  }

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <style>{`
        @keyframes house-float {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.12; }
          50% { transform: translateY(-14px) rotate(-2deg); opacity: 0.22; }
        }
        .house-float {
          animation: house-float ease-in-out infinite;
        }
        @keyframes logo-pop {
          0% { transform: scale(0.6); opacity: 0; }
          60% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .logo-pop {
          animation: logo-pop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes splash-fade-out {
          0% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
        .splash-fade-out {
          animation: splash-fade-out 0.5s ease forwards;
        }
        @keyframes content-fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .content-fade-in {
          animation: content-fade-in 0.6s ease forwards;
        }
      `}</style>

      {showSplash && (
        <div
          className={`fixed inset-0 z-[200] bg-white flex items-center justify-center ${
            !showSplash ? "" : ""
          }`}
        >
          {houseLayout.map((h, i) => (
            <HouseIcon
              key={i}
              size={h.size}
              style={{
                position: "absolute",
                top: h.top,
                left: h.left,
                animationDelay: h.delay,
                animationDuration: h.duration,
              }}
            />
          ))}
          <div className="flex flex-col items-center logo-pop">
            <img src="/logo.png" alt="HnAlink" className="h-20 w-20 rounded-2xl mb-4 shadow-lg" />
            <p className="text-[#1E88E5] font-bold text-2xl tracking-tight">HnAlink</p>
          </div>
        </div>
      )}

      {!showSplash && (
        <div className="content-fade-in flex flex-col items-center justify-center min-h-screen px-6 text-center relative">
          {houseLayout.map((h, i) => (
            <HouseIcon
              key={i}
              size={h.size}
              style={{
                position: "absolute",
                top: h.top,
                left: h.left,
                animationDelay: h.delay,
                animationDuration: h.duration,
              }}
            />
          ))}

          <img src="/logo.png" alt="HnAlink" className="h-16 w-16 rounded-2xl mb-6 relative z-10" />
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight relative z-10">
            Find your next place<br />
            to <span className="text-[#1E88E5]">call home</span>
          </h1>
          <p className="text-gray-500 max-w-sm mb-10 text-lg relative z-10">
            Hostels and apartments near campus, reviewed by occupants.
          </p>

          <div className="w-full max-w-sm space-y-3 relative z-10">
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

          <p className="text-gray-400 text-sm mt-8 relative z-10">
            New here?{" "}
            <Link href="/signup/student" className="text-[#1E88E5] hover:underline">
              Sign up as an occupant
            </Link>{" "}
            or{" "}
            <Link href="/signup/owner" className="text-[#1E88E5] hover:underline">
              as a host
            </Link>
          </p>
        </div>
      )}

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
                ? "You'll be taken to the occupant login."
                : "You'll be taken to the host login."}
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