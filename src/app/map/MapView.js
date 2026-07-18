"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";

const hostelIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  className: "",
  html: `<div class="user-dot-outer"><div class="user-dot-inner"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function RecenterOnFirstFix({ location, hasCentered, setHasCentered }) {
  const map = useMap();
  useEffect(() => {
    if (location && !hasCentered) {
      map.flyTo([location.lat, location.lng], 15);
      setHasCentered(true);
    }
  }, [location, hasCentered, map, setHasCentered]);
  return null;
}

function RecenterButton({ location }) {
  const map = useMap();
  if (!location) return null;
  return (
    <button
      onClick={() => map.flyTo([location.lat, location.lng], 15)}
      className="absolute bottom-6 right-4 z-[1000] bg-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
      aria-label="Center on my location"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export default function MapView({ hostels }) {
  const [userLocation, setUserLocation] = useState(null);
  const [hasCentered, setHasCentered] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);

  const defaultCenter = hostels.length > 0
    ? [hostels[0].lat, hostels[0].lng]
    : [5.6037, -0.1870]; // fallback: Accra, Ghana

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationNotice("Your browser doesn't support location. Showing all listings.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLocationNotice(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationNotice("Location access denied. Showing all listings.");
        } else if (err.code === err.TIMEOUT) {
          setLocationNotice("Couldn't get your location in time. Showing all listings.");
        } else {
          setLocationNotice("Couldn't get your location. Showing all listings.");
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="relative h-full w-full">
      <style>{`
        .user-dot-outer {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-dot-inner {
          width: 14px;
          height: 14px;
          background: #1E88E5;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.4), 0 1px 4px rgba(0,0,0,0.3);
          position: relative;
        }
        .user-dot-inner::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 14px;
          height: 14px;
          background: rgba(30, 136, 229, 0.4);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: user-dot-pulse 2s infinite;
        }
        @keyframes user-dot-pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0; }
        }
      `}</style>

      {locationNotice && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white shadow-md rounded-full px-4 py-2 flex items-center gap-2 text-sm text-gray-700">
          <span>{locationNotice}</span>
          <button
            onClick={() => setLocationNotice(null)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      <MapContainer center={defaultCenter} zoom={12} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {hostels.map((hostel) => (
          <Marker key={hostel.id} position={[hostel.lat, hostel.lng]} icon={hostelIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{hostel.name}</p>
                <p className="text-gray-500">{hostel.town}</p>
                <p className="text-[#1E88E5] font-semibold">GHC{hostel.price}/mo</p>
                <Link href={`/hostel/${hostel.id}`} className="text-[#1E88E5] hover:underline text-xs">
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}

        {userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={userLocation.accuracy}
              pathOptions={{ color: "#1E88E5", fillColor: "#1E88E5", fillOpacity: 0.1, weight: 1 }}
            />
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
          </>
        )}

        <RecenterOnFirstFix
          location={userLocation}
          hasCentered={hasCentered}
          setHasCentered={setHasCentered}
        />
        <RecenterButton location={userLocation} />
      </MapContainer>
    </div>
  );
}