"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const ANGLE_STEP = 45;
const TARGET_ANGLES = Array.from({ length: 360 / ANGLE_STEP }, (_, i) => i * ANGLE_STEP);

function normalizeHeading(raw) {
  let h = raw % 360;
  if (h < 0) h += 360;
  return h;
}

function nearestBucket(heading) {
  return Math.round(heading / ANGLE_STEP) * ANGLE_STEP % 360;
}

export default function RoomScanCapture() {
  const router = useRouter();
  const params = useParams();
  const hostelId = params.hostelId;

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [permissionState, setPermissionState] = useState("idle");
  const [permissionError, setPermissionError] = useState(null);
  const [heading, setHeading] = useState(null);
  const [captured, setCaptured] = useState({});
  const [roomLabel, setRoomLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [lastCapturedBucket, setLastCapturedBucket] = useState(null);

  const capturedRef = useRef({});
  useEffect(() => {
    capturedRef.current = captured;
  }, [captured]);

  const captureFrame = useCallback((bucket) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCaptured((prev) => ({ ...prev, [bucket]: blob }));
        setLastCapturedBucket(bucket);
        setTimeout(() => setLastCapturedBucket(null), 800);
      },
      "image/jpeg",
      0.85
    );
  }, []);

  const handleOrientation = useCallback(
    (e) => {
      let raw;
      if (typeof e.webkitCompassHeading === "number") {
        raw = e.webkitCompassHeading;
      } else if (typeof e.alpha === "number") {
        raw = 360 - e.alpha;
      } else {
        return;
      }
      const norm = normalizeHeading(raw);
      setHeading(norm);

      const bucket = nearestBucket(norm);
      const diff = Math.min(Math.abs(norm - bucket), 360 - Math.abs(norm - bucket));

      if (diff < 8 && !(bucket in capturedRef.current)) {
        captureFrame(bucket);
      }
    },
    [captureFrame]
  );

  async function startCapture() {
    setPermissionError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
    } catch (err) {
      setPermissionError("Camera access was denied. Please allow camera access and try again.");
      setPermissionState("idle");
      return;
    }

    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const result = await DeviceOrientationEvent.requestPermission();
        if (result !== "granted") {
          setPermissionError("Compass access was denied. This is needed to guide the scan.");
          return;
        }
      } catch (err) {
        setPermissionError("Couldn't request compass permission on this device.");
        return;
      }
    }

    window.addEventListener("deviceorientation", handleOrientation, true);
    setPermissionState("active");
  }

  useEffect(() => {
    if (permissionState !== "active") return;
    if (!videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    videoRef.current.play().catch(() => {});
  }, [permissionState]);

  function stopCapture() {
    window.removeEventListener("deviceorientation", handleOrientation, true);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  useEffect(() => {
    return () => stopCapture();
  }, []);

  async function handleUpload() {
    const entries = Object.entries(captured);
    if (entries.length < 4) {
      setUploadError("Please capture at least 4 angles before saving.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    const { data: { user } } = await supabase.auth.getUser();

    try {
      const uploaded = await Promise.all(
        entries.map(async ([angle, blob]) => {
          const fileName = `${user.id}-${hostelId}-${Date.now()}-${angle}.jpg`;
          const { error: uploadErr } = await supabase.storage.from("room-scans").upload(fileName, blob);
          if (uploadErr) throw uploadErr;
          const { data: urlData } = supabase.storage.from("room-scans").getPublicUrl(fileName);
          return { angle: Number(angle), url: urlData.publicUrl };
        })
      );

      uploaded.sort((a, b) => a.angle - b.angle);

      const { error: insertError } = await supabase.from("room_panoramas").insert([{
        hostel_id: hostelId,
        room_label: roomLabel.trim() || "Room",
        images: uploaded,
      }]);

      if (insertError) throw insertError;

      stopCapture();
      setSaved(true);
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const capturedCount = Object.keys(captured).length;

  if (saved) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Room scan saved</h1>
        <p className="text-gray-500 mb-8">Occupants can now look around this room on your listing.</p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSaved(false);
              setCaptured({});
              setRoomLabel("");
              setPermissionState("idle");
            }}
            className="border border-gray-300 text-gray-700 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Scan another room
          </button>
          <button
            onClick={() => router.push("/dashboard?tab=listings")}
            className="bg-[#1E88E5] text-white font-semibold px-5 py-3 rounded-xl hover:bg-[#1565C0] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="p-4 flex items-center justify-between text-white z-10">
        <button onClick={() => router.back()} className="text-sm">‹ Back</button>
        <p className="text-sm font-semibold">360° Room Scan</p>
        <div className="w-10" />
      </div>

      {permissionState === "idle" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center text-white">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-2">Scan this room</h1>
          <p className="text-white/60 mb-2 max-w-xs">
            Stand in the center of the room, then slowly turn in a full circle. We&apos;ll capture photos automatically as you turn.
          </p>
          <p className="text-white/40 text-sm mb-8 max-w-xs">
            Works best on a phone held upright, outdoors of thick metal or electronics.
          </p>

          <div className="mb-6 w-full max-w-xs">
            <input
              type="text"
              value={roomLabel}
              onChange={(e) => setRoomLabel(e.target.value)}
              placeholder="Room name (e.g. Bedroom, Kitchen)"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#1E88E5]"
            />
          </div>

          {permissionError && <p className="text-red-400 text-sm mb-4 max-w-xs">{permissionError}</p>}

          <button
            onClick={startCapture}
            className="bg-[#1E88E5] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#1565C0] transition-colors text-lg"
          >
            Start Scanning
          </button>
        </div>
      )}

      {permissionState === "active" && (
        <div className="flex-1 relative overflow-hidden">
          <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {lastCapturedBucket !== null && (
            <div className="absolute inset-0 bg-white/30 pointer-events-none" />
          )}

          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 rounded-full px-4 py-2">
            <p className="text-white text-sm font-medium">{capturedCount} / {TARGET_ANGLES.length} angles captured</p>
          </div>

          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
              {TARGET_ANGLES.map((angle) => {
                const rad = ((angle - 90) * Math.PI) / 180;
                const x = 50 + 44 * Math.cos(rad);
                const y = 50 + 44 * Math.sin(rad);
                const isCaptured = angle in captured;
                return (
                  <circle
                    key={angle}
                    cx={x}
                    cy={y}
                    r={isCaptured ? 6 : 4}
                    fill={isCaptured ? "#22C55E" : "rgba(255,255,255,0.4)"}
                  />
                );
              })}
              {heading !== null && (
                <g transform={`rotate(${heading - 90} 50 50)`}>
                  <polygon points="50,10 46,20 54,20" fill="#1E88E5" />
                </g>
              )}
            </svg>
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 px-6">
            <p className="text-white text-center text-sm bg-black/60 rounded-full px-4 py-2">
              {capturedCount < TARGET_ANGLES.length
                ? "Slowly turn around to capture all angles"
                : "All angles captured! You can finish now."}
            </p>
            {uploadError && <p className="text-red-400 text-sm text-center bg-black/60 rounded-lg px-3 py-2">{uploadError}</p>}
            <button
              onClick={handleUpload}
              disabled={uploading || capturedCount < 4}
              className="w-full max-w-xs bg-[#1E88E5] text-white font-semibold py-4 rounded-xl hover:bg-[#1565C0] transition-colors disabled:opacity-40 text-lg"
            >
              {uploading ? "Saving..." : `Finish (${capturedCount} captured)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}