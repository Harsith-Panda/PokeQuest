"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useStore } from "@/app/utils/store/store";
import {
  Zap,
  Flame,
  Droplet,
  Leaf,
  Brain,
  Star,
  Snowflake,
  Mountain,
  Sparkles,
  Waves,
  Target,
  ArrowLeft,
  Trophy,
  X,
} from "lucide-react";
import { api } from "@/app/utils/api/api";
import { useLocationTracker } from "@/app/utils/hooks/useLocationTracker";

// Pokemon type icons mapping
const TYPE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; size?: number }>
> = {
  normal: Star,
  fire: Flame,
  water: Droplet,
  grass: Leaf,
  electric: Zap,
  psychic: Brain,
  rock: Mountain,
  ice: Snowflake,
  dragon: Waves,
  fairy: Sparkles,
};

// Rarity colors
const RARITY_COLORS: Record<string, string> = {
  common: "text-text-secondary",
  uncommon: "text-accent",
  rare: "text-accent-secondary",
  legendary: "text-accent-tertiary",
};

const RARITY_BG: Record<string, string> = {
  common: "bg-hover",
  uncommon: "bg-accent/20",
  rare: "bg-accent-secondary/20",
  legendary: "bg-accent-tertiary/20",
};

export default function PokemonCapturePage() {
  const router = useRouter();
  const params = useParams();
  const spawnId = params.id as string; // Get spawn ID from URL

  const { spawns, user } = useStore();
  const { location, permissionState, requestPermission } = useLocationTracker();

  // Manual location fallback (user can input coords if geolocation fails)
  const [manualLocation, setManualLocation] = useState<{ lat: string; lng: string } | null>(
    user?.lastLocation?.coordinates
      ? { lat: String(user.lastLocation.coordinates[1]), lng: String(user.lastLocation.coordinates[0]) }
      : null,
  );

  // Find the spawn
  const spawn = spawns.find((s) => s._id === spawnId);

  const [captureState, setCaptureState] = useState<
    "ready" | "throwing" | "catching" | "success" | "failed"
  >("ready");
  const [shakeCount, setShakeCount] = useState(0);
  const [captureAttempts, setCaptureAttempts] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [captureResult, setCaptureResult] = useState<{
    gainedXp: number;
    newLevel: number;
    totalXp: number;
  } | null>(null);

  // Redirect if spawn not found
  useEffect(() => {
    if (!spawn) {
      router.push("/map");
    }
  }, [spawn, router]);

  if (!spawn) {
    return null;
  }

  const pokemon = spawn.pokemonId;
  const TypeIcon = TYPE_ICONS[pokemon.elementType] || Star;

  // Calculate capture probability based on rarity
  const getCaptureRate = (): number => {
    switch (pokemon.rarity) {
      case "common":
        return 0.7; // 70% base
      case "uncommon":
        return 0.5; // 50% base
      case "rare":
        return 0.3; // 30% base
      case "legendary":
        return 0.1; // 10% base
      default:
        return 0.5;
    }
  };

  const getCoordsForRequest = () => {
    if (location) return { lat: location.latitude, lng: location.longitude };
    if (manualLocation) return { lat: Number(manualLocation.lat), lng: Number(manualLocation.lng) };
    return null;
  };

  const attemptCapture = async () => {
    const coords = getCoordsForRequest();
    if (!coords) {
      const shouldRequest = confirm(
        "Location not available. Try to request permission now? Or enter coordinates manually.",
      );
      if (shouldRequest) {
        await requestPermission();
      }
      return;
    }

    try {
      setCaptureState("catching");

      const res = await api.post("/api/spawn/capture-spawn", {
        spawnId: spawn._id
      });

      const data = res?.data || {};
      if (data.success || data.pokemon) {
        setCaptureState("success");
        setCaptureResult({
          gainedXp: data.gainedXp ?? data.gained_xp ?? 0,
          newLevel: data.newLevel ?? data.new_level ?? user?.stats?.level ?? 0,
          totalXp: data.totalXp ?? data.total_xp ?? 0,
        });
        setShowSuccessModal(true);
      } else {
        // backend may return message on failure
        const msg = data.message || "Capture failed";
        alert(`❌ ${msg}`);
        setCaptureState("failed");
        setTimeout(() => setCaptureState("ready"), 800);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || String(error);
      if (errorMessage?.includes("Too far")) {
        alert("❌ You're too far from this Pokémon! Get within 100 meters to catch it.");
      } else if (errorMessage?.includes("despawned")) {
        alert("❌ This Pokémon has despawned!");
        router.push("/app/map");
        return;
      } else if (errorMessage?.includes("location not set")) {
        alert("❌ Location not available. Please enable location services or enter coords manually.");
      } else {
        console.error("Capture failed:", error);
      }

      setCaptureState("failed");
      setTimeout(() => {
        setCaptureState("ready");
      }, 600);
    }
  };

  const handleThrow = async () => {
    if (captureState !== "ready") return;

    setCaptureState("throwing");
    setCaptureAttempts((prev) => prev + 1);

    // Throw animation
    await new Promise((resolve) => setTimeout(resolve, 800));

    setCaptureState("catching");

    // Shake animation (1-3 shakes) for visual effect
    const maxShakes = 3;
    let currentShake = 0;

    const shakeInterval = setInterval(() => {
      currentShake++;
      setShakeCount(currentShake);

      if (currentShake >= maxShakes) {
        clearInterval(shakeInterval);

        setTimeout(async () => {
          await attemptCapture();
        }, 500);
      }
    }, 600);
  };

  // Return to map
  const returnToMap = () => {
    router.push("/app/map");
  };

  return (
    <div className="min-h-screen bg-bg sky-gradient p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <header className="max-w-4xl mx-auto mb-6 relative z-10">
        <button
          onClick={returnToMap}
          className="flex items-center gap-2 px-4 py-2 bg-surface border-2 border-border rounded-xl hover:bg-hover transition-colors"
        >
          <ArrowLeft size={20} className="text-text-primary" />
          <span className="font-accents text-sm text-text-primary">
            Back to Map
          </span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <div
                className={`bg-surface rounded-3xl border-4 border-border shadow-2xl p-8 ${
                  captureState === "catching" ? "capture-shake" : ""
                } ${captureState === "success" ? "spawn-in" : ""}`}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div
                    className={`px-4 py-1.5 ${RARITY_BG[pokemon.rarity]} border-2 border-border rounded-full`}
                  >
                    <span
                      className={`font-accents text-xs font-bold uppercase ${RARITY_COLORS[pokemon.rarity]}`}
                    >
                      {pokemon.rarity}
                    </span>
                  </div>
                </div>

                <div className="relative mb-6">
                  <div
                    className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center relative ${
                      captureState === "ready" ? "float" : ""
                    }`}
                    style={{
                      background: `radial-gradient(circle, var(--color-${pokemon.elementType}) 0%, var(--color-bg) 100%)`,
                    }}
                  >
                    <TypeIcon size={120} className="text-white opacity-90" />

                    {pokemon.rarity === "legendary" && (
                      <>
                        <Sparkles
                          className="absolute top-4 right-4 text-accent-tertiary animate-pulse"
                          size={24}
                        />
                        <Sparkles
                          className="absolute bottom-4 left-4 text-accent-tertiary animate-pulse"
                          size={20}
                          style={{ animationDelay: "0.5s" }}
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <h1 className="font-logo text-3xl sm:text-4xl text-text-primary mb-2">
                    {pokemon.name}
                  </h1>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="px-3 py-1 bg-hover rounded-lg">
                      <span className="font-accents text-xs text-text-secondary uppercase">
                        {pokemon.elementType}
                      </span>
                    </div>
                    <div className="px-3 py-1 bg-hover rounded-lg">
                      <span className="font-accents text-xs text-text-secondary">
                        XP: {pokemon.baseXp || 500}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-hover/50 rounded-xl p-3">
                      <div className="font-body text-[10px] text-text-secondary mb-1">
                        Base XP
                      </div>
                      <div className="font-accents text-lg font-bold text-accent">
                        {pokemon.baseXp}
                      </div>
                    </div>
                    <div className="bg-hover/50 rounded-xl p-3">
                      <div className="font-body text-[10px] text-text-secondary mb-1">
                        Capture Rate
                      </div>
                      <div className="font-accents text-lg font-bold text-accent-secondary">
                        {(getCaptureRate() * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {captureState === "throwing" && (
                    <div className="text-accent font-accents text-sm animate-pulse">
                      Throwing Pokéball...
                    </div>
                  )}
                  {captureState === "catching" && (
                    <div className="text-accent-secondary font-accents text-sm">
                      Shaking: {shakeCount}/3
                    </div>
                  )}
                  {captureState === "failed" && (
                    <div className="text-accent-red font-accents text-sm flex items-center justify-center gap-2">
                      <X size={16} />
                      Escaped! Try again
                    </div>
                  )}
                </div>
              </div>

              {captureState === "throwing" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-b from-accent-red via-black to-white border-4 border-black shadow-2xl animate-bounce" />
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Capture Controls */}
          <div className="flex flex-col justify-center">
            <div className="bg-surface rounded-3xl border-4 border-border shadow-2xl p-6 sm:p-8">
              <h2 className="font-accents text-2xl text-text-primary font-bold mb-6 flex items-center gap-2">
                <Target className="text-accent" size={28} />
                Capture Wild Pokémon
              </h2>

              {/* Instructions */}
              <div className="bg-hover/30 rounded-2xl p-4 mb-6">
                <p className="font-body text-sm text-text-secondary leading-relaxed">
                  Tap the button below to throw a Pokéball and attempt to
                  capture this wild Pokémon.
                </p>
              </div>

              {/* Attempt Counter */}
              <div className="flex items-center justify-between mb-6 p-4 bg-hover/50 rounded-xl">
                <span className="font-body text-sm text-text-secondary">
                  Attempts Made
                </span>
                <span className="font-accents text-lg font-bold text-text-primary">
                  {captureAttempts}
                </span>
              </div>

              {/* Capture Button */}
              <button
                onClick={handleThrow}
                disabled={captureState !== "ready"}
                className={`w-full py-6 rounded-2xl border-4 font-accents font-bold text-lg flex items-center justify-center gap-3 ${
                  captureState === "ready"
                    ? "bg-accent/85  border-white shadow-lg hover:scale-105"
                    : "bg-hover border-border text-text-secondary cursor-not-allowed opacity-50"
                }`}
              >
                {captureState === "ready" ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-b from-accent-red via-black to-white border-2 border-white" />
                    <span className="text-black">Throw Pokéball</span>
                  </>
                ) : captureState === "throwing" ? (
                  <span>Throwing...</span>
                ) : captureState === "catching" ? (
                  <span>Capturing...</span>
                ) : captureState === "failed" ? (
                  <span>Try Again</span>
                ) : (
                  <span>Captured!</span>
                )}
              </button>

              {/* Tips */}
              <div className="mt-6 p-4 bg-info/10 border-2 border-info/30 rounded-xl">
                <div className="flex gap-2 mb-2">
                  <Sparkles className="text-info flex-shrink-0" size={20} />
                  <span className="font-accents text-xs text-info font-bold uppercase">
                    Pro Tip
                  </span>
                </div>
                <p className="font-body text-xs text-text-secondary leading-relaxed">
                  Legendary Pokémon have only a 10% capture rate. Don't give up
                  if you fail on the first try!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-3xl border-4 border-accent shadow-2xl p-8 max-w-md w-full spawn-in">
            <div className="text-center">
              <div className="mb-6">
                <Trophy
                  className="mx-auto text-accent-tertiary animate-pulse"
                  size={80}
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="font-logo text-3xl text-text-primary mb-3">
                Success!
              </h2>
              <p className="font-accents text-lg text-accent mb-2">
                {pokemon.name} was caught!
              </p>

              {/* XP and Level Info */}
              {captureResult && (
                <div className="bg-hover/50 rounded-2xl p-4 mb-6 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-text-secondary">
                      XP Gained
                    </span>
                    <span className="font-accents text-lg font-bold text-accent">
                      +{captureResult.gainedXp}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-text-secondary">
                      Total XP
                    </span>
                    <span className="font-accents text-base font-medium text-text-primary">
                      {captureResult.totalXp}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body text-sm text-text-secondary">
                      Level
                    </span>
                    <span className="font-accents text-lg font-bold text-accent-secondary">
                      {captureResult.newLevel}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={returnToMap}
                  className="w-full bg-gradient-to-r from-accent to-accent-secondary text-text-primary font-accents font-bold py-4 rounded-xl border-3 border-text-primary shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  Return to Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location fallback UX (styled with globals.css theme classes) */}
      {!location && (
        <div className="max-w-md mx-auto p-4 bg-surface rounded-2xl border-2 border-border shadow-lg mb-6">
          <h3 className="font-accents text-lg text-text-primary mb-2">Location not available</h3>
          <p className="text-sm text-text-secondary mb-3">
            Your browser could not provide location ("kcl" / permission issue). You can:
          </p>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => requestPermission()}
              className="px-3 py-2 bg-accent text-black rounded-lg border-2 border-accent-secondary"
            >
              Request Permission
            </button>
            <button
              onClick={() => {
                // prefill manual if possible
                if (!manualLocation && user?.lastLocation?.coordinates) {
                  setManualLocation({
                    lat: String(user.lastLocation.coordinates[1]),
                    lng: String(user.lastLocation.coordinates[0]),
                  });
                } else {
                  setManualLocation({ lat: "", lng: "" });
                }
              }}
              className="px-3 py-2 bg-hover border-2 border-border rounded-lg"
            >
              Enter Coordinates Manually
            </button>
          </div>

          {manualLocation !== null && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  value={manualLocation.lat}
                  onChange={(e) => setManualLocation({ ...manualLocation, lat: e.target.value })}
                  placeholder="Latitude"
                  className="flex-1 px-3 py-2 rounded-lg bg-hover border-2 border-border text-text-primary"
                />
                <input
                  value={manualLocation.lng}
                  onChange={(e) => setManualLocation({ ...manualLocation, lng: e.target.value })}
                  placeholder="Longitude"
                  className="flex-1 px-3 py-2 rounded-lg bg-hover border-2 border-border text-text-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    attemptCapture();
                  }}
                  className="px-4 py-2 bg-accent text-black rounded-lg border-2 border-accent-secondary"
                >
                  Use These Coordinates & Try Capture
                </button>
                <button
                  onClick={() => setManualLocation(null)}
                  className="px-4 py-2 bg-hover border-2 border-border rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
