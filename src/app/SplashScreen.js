export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center overflow-hidden">
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
      `}</style>

      {[
        { top: "8%", left: "6%", size: 46, delay: "0s", duration: "7s" },
        { top: "18%", left: "82%", size: 34, delay: "1.2s", duration: "8s" },
        { top: "62%", left: "10%", size: 38, delay: "0.6s", duration: "6.5s" },
        { top: "72%", left: "78%", size: 50, delay: "1.8s", duration: "7.5s" },
        { top: "38%", left: "90%", size: 28, delay: "0.3s", duration: "9s" },
        { top: "48%", left: "2%", size: 30, delay: "2.1s", duration: "6.8s" },
        { top: "85%", left: "45%", size: 32, delay: "0.9s", duration: "7.2s" },
        { top: "5%", left: "45%", size: 26, delay: "1.5s", duration: "8.3s" },
      ].map((h, i) => (
        <svg
          key={i}
          width={h.size}
          height={h.size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1E88E5"
          strokeWidth="1"
          className="house-float"
          style={{
            position: "absolute",
            top: h.top,
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.duration,
          }}
        >
          <path d="M4 21V10l8-6 8 6v11h-5v-7h-6v7z" />
        </svg>
      ))}

      <div className="flex flex-col items-center logo-pop">
        <img src="/logo.png" alt="HnAlink" className="h-20 w-20 rounded-2xl mb-4 shadow-lg" />
        <p className="text-[#1E88E5] font-bold text-2xl tracking-tight">HnAlink</p>
      </div>
    </div>
  );
}
