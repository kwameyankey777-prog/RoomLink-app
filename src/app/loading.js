export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="relative w-16 h-16 mb-4">
        <img src="/logo.png" alt="" className="w-full h-full p-2" />
        <div className="absolute inset-0 rounded-full border-2 border-[#1E88E5]/20 border-t-[#1E88E5] animate-spin" />
      </div>
      <p className="text-gray-400 text-sm tracking-wide flex">
        {"Loading".split("").map((c, i) => (
          <span
            key={i}
            className="inline-block animate-bounce"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {c}
          </span>
        ))}
      </p>
    </div>
  );
}