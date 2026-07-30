"use client";

import { useEffect, useRef, useState } from "react";

export default function RoomPanoramaViewer({ panorama }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const isSphere = panorama.panorama_type === "sphere";
  const imageUrl = panorama.images?.[0]?.url;

  useEffect(() => {
    if (!isSphere || !imageUrl) return;

    let cancelled = false;

    async function loadPannellum() {
      if (!document.getElementById("pannellum-css")) {
        const link = document.createElement("link");
        link.id = "pannellum-css";
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/pannellum/2.5.6/pannellum.css";
        document.head.appendChild(link);
      }

      if (!window.pannellum) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pannellum/2.5.6/pannellum.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      if (cancelled || !containerRef.current || !window.pannellum) return;

      viewerRef.current = window.pannellum.viewer(containerRef.current, {
        type: "equirectangular",
        panorama: imageUrl,
        autoLoad: true,
        showZoomCtrl: true,
        showFullscreenCtrl: true,
        compass: false,
        hfov: 100,
      });
      setLoaded(true);
    }

    loadPannellum();

    return () => {
      cancelled = true;
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [isSphere, imageUrl]);

  if (!isSphere) {
    return <LegacyFlipViewer panorama={panorama} />;
  }

  return (
    <div className="mb-4">
      <div className="relative h-72 rounded-2xl overflow-hidden bg-gray-900">
        <div ref={containerRef} className="w-full h-full" />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm">
            Loading 360° view...
          </div>
        )}
        <p className="absolute top-3 left-3 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full pointer-events-none">
          {panorama.room_label}
        </p>
      </div>
    </div>
  );
}

function LegacyFlipViewer({ panorama }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const dragStartX = { current: null };
  const dragAccum = { current: 0 };
  const [dragging, setDragging] = useState(false);
  const images = panorama.images || [];
  if (images.length === 0) return null;

  function handlePointerDown(e) {
    dragStartX.current = e.clientX ?? e.touches?.[0]?.clientX;
    dragAccum.current = 0;
    setDragging(true);
  }
  function handlePointerMove(e) {
    if (dragStartX.current === null) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    if (clientX === undefined) return;
    const delta = clientX - dragStartX.current;
    dragStartX.current = clientX;
    dragAccum.current += delta;
    while (dragAccum.current > 30) {
      setFrameIndex((prev) => (prev - 1 + images.length) % images.length);
      dragAccum.current -= 30;
    }
    while (dragAccum.current < -30) {
      setFrameIndex((prev) => (prev + 1) % images.length);
      dragAccum.current += 30;
    }
  }
  function handlePointerUp() {
    dragStartX.current = null;
    setDragging(false);
  }

  return (
    <div className="mb-4">
      <div
        className="relative h-72 rounded-2xl overflow-hidden bg-gray-900 select-none touch-none"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
        onMouseDown={handlePointerDown}
        onMouseMove={dragging ? handlePointerMove : undefined}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        <img src={images[frameIndex].url} alt={panorama.room_label} className="w-full h-full object-cover pointer-events-none" draggable={false} />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
          Drag to look around
        </div>
        <p className="absolute top-3 right-3 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full">
          {panorama.room_label}
        </p>
      </div>
    </div>
  );
}