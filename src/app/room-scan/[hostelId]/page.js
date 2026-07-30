"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function RoomScanUpload() {
  const router = useRouter();
  const params = useParams();
  const hostelId = params.hostelId;

  const [roomLabel, setRoomLabel] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [saved, setSaved] = useState(false);

  function handleFileSelect(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setUploadError(null);
  }

  async function handleSave() {
    if (!file) {
      setUploadError("Please choose a 360° photo first.");
      return;
    }
    setUploading(true);
    setUploadError(null);

    const { data: { user } } = await supabase.auth.getUser();

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${hostelId}-${Date.now()}.${fileExt}`;
      const { error: uploadErr } = await supabase.storage.from("room-scans").upload(fileName, file);
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from("room-scans").getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("room_panoramas").insert([{
        hostel_id: hostelId,
        room_label: roomLabel.trim() || "Room",
        images: [{ angle: 0, url: urlData.publicUrl }],
        panorama_type: "sphere",
      }]);

      if (insertError) throw insertError;
      setSaved(true);
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">360° view saved</h1>
        <p className="text-gray-500 mb-8">Occupants can now look around this room on your listing.</p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSaved(false);
              setFile(null);
              setPreviewUrl(null);
              setRoomLabel("");
            }}
            className="border border-gray-300 text-gray-700 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Add another room
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
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-md mx-auto">
        <button onClick={() => router.back()} className="text-[#1E88E5] text-sm font-medium mb-6">‹ Back</button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add a 360° view</h1>
        <p className="text-gray-500 mb-8">
          Use your phone&apos;s built-in <strong>Panorama</strong> or <strong>Photo Sphere</strong> camera mode
          (or the free Google Street View app) to capture a full 360° photo of the room, then upload it here.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Room name</label>
          <input
            type="text"
            value={roomLabel}
            onChange={(e) => setRoomLabel(e.target.value)}
            placeholder="e.g. Bedroom, Kitchen"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#1E88E5]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">360° photo</label>
          {previewUrl ? (
            <div className="relative rounded-2xl overflow-hidden mb-3 bg-gray-100">
              <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
            </div>
          ) : null}
          <label className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer w-full justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {file ? "Choose a different photo" : "Choose 360° photo"}
            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </label>
        </div>

        {uploadError && <p className="text-red-500 text-sm mb-4">{uploadError}</p>}

        <button
          onClick={handleSave}
          disabled={uploading || !file}
          className="w-full bg-[#1E88E5] text-white font-semibold py-4 rounded-xl hover:bg-[#1565C0] transition-colors disabled:opacity-40 text-lg"
        >
          {uploading ? "Uploading..." : "Save 360° View"}
        </button>
      </div>
    </div>
  );
}