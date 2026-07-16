"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ lat, lng, onChange }) {
  const defaultCenter = lat && lng ? [lat, lng] : [5.6037, -0.1870]; // fallback: Accra

  return (
    <MapContainer center={defaultCenter} zoom={13} style={{ height: "300px", width: "100%" }} className="rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onChange} />
      {lat && lng && <Marker position={[lat, lng]} icon={markerIcon} />}
    </MapContainer>
  );
}