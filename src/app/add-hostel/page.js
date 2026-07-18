"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddHostel() {

const LocationPicker = dynamic(() => import("./LocationPicker"), { ssr: false });
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    town: "",
    price: "",
    type: "hostel",
    capacity: "",
    lat: null,
    lng: null,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    if (files.length > 7) {
      setError("You can upload a maximum of 7 photos.");
      setImageFiles(files.slice(0, 7));
      return;
    }
    setError(null);
    setImageFiles(files);
  }

  useEffect(() => {
    async function checkAccess() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signup/owner");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "owner") {
        router.push("/signup/owner");
        return;
      }
      setCheckingAuth(false);
    }
    checkAccess();
  }, [router]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    let imageUrls = [];
    if (imageFiles.length > 0) {
      setUploadingImages(true);
      for (const file of imageFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("hostel-images")
          .upload(fileName, file);

        if (uploadError) {
          setError(`Image upload failed: ${uploadError.message}`);
          setUploadingImages(false);
          setSubmitting(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("hostel-images")
          .getPublicUrl(fileName);

        imageUrls.push(urlData.publicUrl);
      }
      setUploadingImages(false);
    }

    const { error } = await supabase.from("hostels").insert([{
      name: form.name,
      description: form.description,
      address: form.address,
      town: form.town,
      price: parseFloat(form.price),
      type: form.type,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      lat: form.lat,
      lng: form.lng,
      owner_id: user.id,
      status: "pending",
      images: imageUrls,
    }]);

    setSubmitting(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking access...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
       <Link href="/" className="text-[#1E88E5] font-bold text-xl tracking-tight">
          HnAlink
        </Link>
      </header>

      <section className="px-6 py-14 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">List Your Property</h1>
        <p className="text-gray-500 mb-8">
          Fill in the details below. Your listing will be reviewed before it goes live.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1E88E5]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1E88E5]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1E88E5]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Town</label>
            <input
              name="town"
              type="text"
              value={form.town}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1E88E5]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (GHC/mo)</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1E88E5]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1E88E5]"
            >
              <option value="hostel">Hostel</option>
              <option value="apartment">Apartment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.type === "apartment" ? "Bedrooms" : "People per Room"}
            </label>
            <select
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1E88E5]"
            >
              <option value="">Select</option>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photos (max 7)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#1E88E5]"
            />
            {imageFiles.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">{imageFiles.length} photo(s) selected</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pin your location on the map
            </label>
            <LocationPicker
              lat={form.lat}
              lng={form.lng}
              onChange={(lat, lng) => setForm((prev) => ({ ...prev, lat, lng }))}
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.lat && form.lng
                ? `Selected: ${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}`
                : "Tap on the map to set your exact location."}
            </p>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-[#1E88E5] text-white font-semibold px-6 py-2 rounded-lg hover:bg-[#1565c0] transition-colors disabled:opacity-50"
          >
            {uploadingImages ? "Uploading photos..." : submitting ? "Submitting..." : "Submit Listing"}
          </button>
        </form>
      </section>
    </main>
  );
}