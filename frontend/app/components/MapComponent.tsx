"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLocationTracker } from "@/app/utils/hooks/useLocationTracker";
import { useStore } from "../utils/store/store";
import { MapPin } from "lucide-react";

// Pokemon type colors for markers
const RARITY_COLORS: Record<
  string,
  { primary: string; secondary: string; glow: string }
> = {
  common: { primary: "#A8A878", secondary: "#C6C6A7", glow: "168, 168, 120" },
  uncommon: { primary: "#4CAF50", secondary: "#81C784", glow: "76, 175, 80" },
  rare: { primary: "#2196F3", secondary: "#64B5F6", glow: "33, 150, 243" },
  legendary: { primary: "#FFD700", secondary: "#FFE55C", glow: "255, 215, 0" },
};

// Create Pokemon marker icon
const createPokemonIcon = (rarity: string = "common", size: number = 36) => {
  const colors = RARITY_COLORS[rarity] || RARITY_COLORS.common;

  return L.divIcon({
    className: "custom-pokemon-marker",
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <!-- Floating animation wrapper -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: float-pokemon 3s ease-in-out infinite;
        ">
          <!-- Outer glow -->
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${size * 1.2}px;
            height: ${size * 1.2}px;
            background: radial-gradient(circle, rgba(${colors.glow}, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            animation: pulse-glow 2s ease-in-out infinite;
          "></div>

          <!-- Main Pokeball -->
          <div style="
            position: relative;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: linear-gradient(180deg,
              ${colors.primary} 0%,
              ${colors.primary} 47%,
              #2a2a2a 47%,
              #2a2a2a 53%,
              white 53%,
              white 100%
            );
            border: ${Math.max(2, size * 0.06)}px solid #1a1a1a;
            box-shadow:
              0 0 ${size * 0.3}px rgba(${colors.glow}, 0.6),
              0 ${size * 0.15}px ${size * 0.3}px rgba(0, 0, 0, 0.3),
              inset 0 ${size * 0.05}px ${size * 0.1}px rgba(255, 255, 255, 0.3);
          ">
            <!-- Center button -->
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: ${size * 0.35}px;
              height: ${size * 0.35}px;
              background: white;
              border: ${Math.max(2, size * 0.08)}px solid #1a1a1a;
              border-radius: 50%;
              box-shadow:
                inset 0 ${size * 0.03}px ${size * 0.06}px rgba(0, 0, 0, 0.2),
                0 0 ${size * 0.1}px rgba(${colors.glow}, 0.8);
            ">
              <!-- Center dot -->
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: ${size * 0.15}px;
                height: ${size * 0.15}px;
                background: ${colors.primary};
                border-radius: 50%;
                box-shadow: 0 0 ${size * 0.08}px rgba(${colors.glow}, 0.9);
              "></div>
            </div>
          </div>
        </div>
      </div>

      <style>
        @keyframes float-pokemon {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-8px);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Create animated trainer icon with dynamic sizing
const createTrainerIcon = (size: number = 40) => {
  return L.divIcon({
    className: "custom-trainer-marker",
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <!-- Outer pulse ring -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${size}px;
          height: ${size}px;
          background: radial-gradient(circle, rgba(0, 230, 118, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse-ring 2s ease-out infinite;
        "></div>

        <!-- Main marker circle -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${size * 0.8}px;
          height: ${size * 0.8}px;
          background: linear-gradient(135deg, #00e676 0%, #00ff9f 100%);
          border-radius: 50%;
          border: ${Math.max(3, size * 0.075)}px solid #1a237e;
          box-shadow:
            0 0 ${size * 0.5}px rgba(0, 230, 118, 0.8),
            0 ${size * 0.1}px ${size * 0.3}px rgba(0, 0, 0, 0.3),
            inset 0 ${size * 0.05}px ${size * 0.1}px rgba(255, 255, 255, 0.5);
          animation: pulse-marker 2s ease-in-out infinite;
        "></div>

        <!-- Inner dot -->
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: ${size * 0.3}px;
          height: ${size * 0.3}px;
          background: #1a237e;
          border-radius: 50%;
          border: ${Math.max(2, size * 0.05)}px solid white;
          box-shadow: 0 ${size * 0.025}px ${size * 0.075}px rgba(0, 0, 0, 0.3);
        "></div>

        <!-- Direction indicator (if moving) -->
        <div style="
          position: absolute;
          top: -${size * 0.15}px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: ${size * 0.15}px solid transparent;
          border-right: ${size * 0.15}px solid transparent;
          border-bottom: ${size * 0.25}px solid #2979ff;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        "></div>
      </div>

      <style>
        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        @keyframes pulse-marker {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08);
          }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Create accuracy circle style
const createAccuracyCircleStyle = (accuracy: number): L.CircleMarkerOptions => {
  const opacity = Math.max(0.1, Math.min(0.3, 50 / accuracy));

  return {
    radius: accuracy,
    color: "#00e676",
    fillColor: "#00e676",
    fillOpacity: opacity,
    weight: 2,
    opacity: 0.6,
  };
};

type Props = {
  onSetLocation?: (coords: { lat: number; lng: number }) => void;
  className?: string;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
};

export default function MapComponent(props: Props) {
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const spawnMarkersRef = useRef<L.Marker[]>([]);
  const { spawns } = useStore();

  // Provide a safe default zoom if prop is not provided
  const [currentZoom, setCurrentZoom] = useState<number>(props.initialZoom ?? 14);
  const [mapReady, setMapReady] = useState(false);
  const [hasInitialCentered, setHasInitialCentered] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Use location tracker hook
  const { location, permissionState, errorCode, requestPermission } = useLocationTracker();

  // Backwards-compatible aliases expected by this component
  // guard access using optional chaining to avoid TS errors when hook shape varies
  const error = errorCode ? new Error(String(errorCode)) : null;
  const isTracking = Boolean(location) && permissionState === "granted";

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      minZoom: props.minZoom,
      maxZoom: props.maxZoom,
    }).setView([20, 0], props.initialZoom ?? 3);

    mapRef.current = map;

    // Add zoom control (bottom-right)
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      className: "map-tiles",
    }).addTo(map);

    // Track zoom changes
    map.on("zoom", () => {
      setCurrentZoom(map.getZoom());
    });

    // wire generic click handler so users can pick location by clicking
    map.on("click", handleMapClick);

    setMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", handleMapClick);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [props.minZoom, props.maxZoom, props.initialZoom]);

  // Update marker and accuracy circle when location changes
  useEffect(() => {
    if (!mapReady || !mapRef.current || !location || permissionState !== "granted") {
      return;
    }

    const latNum = Number((location as any)?.latitude ?? 0);
    const lngNum = Number((location as any)?.longitude ?? 0);
    const accuracyNum = Number((location as any)?.accuracy ?? 0);
    const speedNum = (location as any)?.speed;
    const altitudeNum = (location as any)?.altitude;

    const latlng: L.LatLngExpression = [latNum, lngNum];

    const markerSize = Math.min(60, Math.max(30, currentZoom * 2.2));

    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
      markerRef.current.setIcon(createTrainerIcon(markerSize));
    } else {
      markerRef.current = L.marker(latlng, {
        icon: createTrainerIcon(markerSize),
        zIndexOffset: 1000,
      })
        .addTo(mapRef.current)
        .bindPopup(
          `
          <div style="font-family: Inter, sans-serif; padding: 8px; min-width: 180px;">
            <div style="font-weight: 700; color: #1a237e; font-size: 15px; margin-bottom: 6px; text-align: center;">
              🎮 Your Location
            </div>
            <div style="font-size: 11px; color: #5c6bc0; line-height: 1.5;">
              <strong>Lat:</strong> ${latNum ? latNum.toFixed(6) : "n/a"}<br/>
              <strong>Lng:</strong> ${lngNum ? lngNum.toFixed(6) : "n/a"}<br/>
              <strong>Accuracy:</strong> ${accuracyNum ? "±" + accuracyNum.toFixed(1) + "m" : "n/a"}<br/>
              ${speedNum ? `<strong>Speed:</strong> ${(speedNum * 3.6).toFixed(1)} km/h<br/>` : ""}
              ${typeof altitudeNum === "number" ? `<strong>Altitude:</strong> ${altitudeNum.toFixed(0)}m` : ""}
            </div>
          </div>
          `,
          {
            className: "custom-popup",
          },
        );
    }

    const circleStyle = createAccuracyCircleStyle(accuracyNum || 50);

    if (circleRef.current) {
      circleRef.current.setLatLng(latlng);
      circleRef.current.setRadius(accuracyNum || 50);
      circleRef.current.setStyle(circleStyle);
    } else {
      circleRef.current = L.circle(latlng, circleStyle).addTo(mapRef.current);
    }

    if (!hasInitialCentered) {
      mapRef.current.setView(latlng, props.initialZoom ?? 16, { animate: true });
      setHasInitialCentered(true);
    }
  }, [
    location,
    mapReady,
    permissionState,
    currentZoom,
    hasInitialCentered,
    props.initialZoom,
  ]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    spawnMarkersRef.current.forEach((m) => m.remove());
    spawnMarkersRef.current = [];

    spawns.forEach((spawn) => {
      const [lng, lat] = spawn.location.coordinates;

      if (!mapRef.current) return;

      const marker = L.marker([lat, lng], {
        icon: createPokemonIcon(spawn.pokemonId.rarity),
      })
        .addTo(mapRef.current)
        .bindPopup(`
          <strong>${spawn.pokemonId.name}</strong><br/>
          <span>XP: ${spawn.pokemonId.baseXp}</span><br/>
          <span>Rarity: ${spawn.pokemonId.rarity}</span>
        `);

      // navigate to capture page when a spawn marker is clicked
      marker.on("click", () => handleSpawnMarkerClick(spawn._id, lat, lng));

      spawnMarkersRef.current.push(marker);
    });
  }, [spawns]);

  const recenterMap = () => {
    if (!mapRef.current || !location) return;

    const targetZoom = Math.max(currentZoom, 16);
    mapRef.current.setView(
      [Number((location as any)?.latitude ?? 0), Number((location as any)?.longitude ?? 0)],
      targetZoom,
      {
        animate: true,
        duration: 0.5,
      },
    );
  };

  const handleMapClick = (event: any) => {
    let lat: number | null = null;
    let lng: number | null = null;
    if (event?.latlng) {
      lat = event.latlng.lat;
      lng = event.latlng.lng;
    } else if (event?.latLng?.lat && event?.latLng?.lng) {
      lat = event.latLng.lat();
      lng = event.latLng.lng();
    } else if (Array.isArray(event) && event.length >= 2) {
      lat = event[0];
      lng = event[1];
    }

    if (lat != null && lng != null) {
      setPickedLocation({ lat, lng });
      if (props.onSetLocation) props.onSetLocation({ lat, lng });
    }
  };

  const handleSpawnMarkerClick = (spawnId: string, markerLat?: number, markerLng?: number) => {
    if (markerLat != null && markerLng != null) {
      router.push(`/capture/${spawnId}?lat=${markerLat}&lng=${markerLng}`);
    } else {
      router.push(`/capture/${spawnId}`);
    }
  };

  return (
    <div className={`relative w-full h-full ${props.className}`}>
      <div
        ref={containerRef}
        className="w-full h-full rounded-2xl overflow-hidden border-4 border-border shadow-lg z-0"
      />

      {permissionState === "prompt" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-surface/95 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-accent-secondary shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-3 border-accent-secondary border-t-transparent rounded-full animate-spin" />
            <span className="font-accents text-sm text-text-primary font-medium">
              Requesting Location...
            </span>
          </div>
        </div>
      )}

      {permissionState === "denied" && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000] rounded-2xl">
          <div className="bg-surface p-8 rounded-2xl border-4 border-accent-red shadow-2xl text-center max-w-sm mx-4">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="font-accents font-bold text-xl text-text-primary mb-3">
              Location Access Denied
            </h2>
            <p className="font-body text-sm text-text-secondary mb-6 leading-relaxed">
              PokeQuest needs your location to show nearby Pokémon and track
              your adventure. Please enable location access in your browser
              settings.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-accent to-accent-secondary text-text-primary font-accents font-bold py-3 rounded-xl border-3 border-text-primary shadow-lg hover:scale-105 active:scale-95 transition-transform"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {error && permissionState !== "denied" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-accent-red/95 backdrop-blur-sm px-6 py-3 rounded-full border-2 border-white shadow-lg">
          <span className="font-accents text-sm text-white font-medium">
            ⚠️ Location Error: {error.message}
          </span>
        </div>
      )}

      {permissionState === "granted" && location && (
        <>
          <div className="absolute bottom-4 left-4 z-[1000] bg-surface/95 backdrop-blur-sm px-4 py-2.5 rounded-xl border-2 border-border shadow-lg">
            <div className="font-body text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-accent font-bold text-sm">📍</span>
                <span className="font-mono text-text-primary font-medium">
                  {(location as any)?.latitude?.toFixed?.(6) ?? "n/a"},{" "}
                  {(location as any)?.longitude?.toFixed?.(6) ?? "n/a"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary text-[10px]">
                <span>±{((location as any)?.accuracy ?? "n/a")}</span>
                {((location as any)?.speed ?? 0) > 0.5 && (
                  <span className="text-accent-secondary">
                    🏃 {(((location as any).speed ?? 0) * 3.6).toFixed(1)} km/h
                  </span>
                )}
                {isTracking && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                    Live
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Recenter Button */}
          <button
            onClick={recenterMap}
            className="absolute bottom-20 right-4 z-[500] w-12 h-12 bg-accent hover:bg-accent/90 text-black rounded-full border-3 border-black shadow-lg glow-green transition-all hover:scale-110 active:scale-95 font-bold text-xl"
            aria-label="Recenter map"
            title="Center on your location"
          >
            <MapPin size={24} className="ml-2" />
          </button>
        </>
      )}

      {pickedLocation && (
        <div className="absolute bottom-4 left-4 p-3 bg-surface rounded-md border-2 border-border shadow-md">
          <div className="text-sm text-text-primary">
            Selected: {pickedLocation.lat.toFixed(6)}, {pickedLocation.lng.toFixed(6)}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              className="px-3 py-1 bg-accent text-white rounded-md"
              onClick={() => {
                // center map on chosen point and offer to persist via callback
                if (mapRef.current) {
                  mapRef.current.setView([pickedLocation.lat, pickedLocation.lng], Math.max(currentZoom, 15), { animate: true });
                }
                if (props.onSetLocation) props.onSetLocation(pickedLocation);
                setPickedLocation(null);
              }}
            >
              Use Location
            </button>
            <button
              className="px-3 py-1 bg-hover border-2 border-border rounded-md"
              onClick={() => setPickedLocation(null)}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .map-tiles {
          filter: brightness(0.96) contrast(1.08) saturate(1.15);
        }

        .dark .map-tiles {
          filter: brightness(0.7) contrast(1.25) saturate(0.85) hue-rotate(5deg);
        }

        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          border: 2px solid var(--color-border);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .leaflet-popup-tip {
          border-top-color: var(--color-surface) !important;
        }
      `}</style>
    </div>
  );
}
