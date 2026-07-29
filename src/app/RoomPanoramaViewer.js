"use client";

import { useState, useRef } from "react";

export default function RoomPanoramaViewer({ panorama }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const dragStartX = useRef(null);
  const dragAccumRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  const images = panorama.images || [];
  if (images.length === 0) return null;

  const FRAME_STEP_PX = 30;

  function handlePointerDown(e) {
    dragStartX.current = e.clientX ?? e.touches?.[0]?.clientX;
    dragAccumRef.current = 0;
    setDragging(true);
  }

  function handlePointerMove(e) {
    if (dragStartX.current === null) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    if (clientX === undefined) return;
    const delta = clientX - dragStartX.current;
    dragStartX.current = clientX;
    dragAccumRef.current += delta;

    while (dragAccumRef.current > FRAME_STEP_PX) {
      setFrameIndex((prev) => (prev - 1 + images.length) % images.length);
      dragAccumRef.current -= FRAME_STEP_PX;
    }
    while (dragAccumRef.current < -FRAME_STEP_PX) {
      setFrameIndex((prev) => (prev + 1) % images.length);
      dragAccumRef.current += FRAME_STEP_PX;
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
        <img
          src={images[frameIndex].url}
          alt={panorama.room_label}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />

        <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" />
          </svg>
          360°
        </div>

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