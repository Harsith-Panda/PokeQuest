"use client";

import { useState, useEffect } from "react";
import MapComponent from "@/app/components/MapComponent";
import AppNavbar from "@/app/components/AppNavbar";
import { useStore } from "@/app/utils/store/store";
import { useLocationTracker } from "@/app/utils/hooks/useLocationTracker";
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
  MapPin,
  Activity,
  Target,
  Footprints,
  Compass,
} from "lucide-react";

import { api } from "@/app/utils/api/api";

// Pokemon type colors mapping (matching your schema)
const TYPE_COLORS: Record<string, string> = {
  normal: "bg-hover",
  fire: "bg-fire",
  water: "bg-water",
  grass: "bg-grass",
  electric: "bg-electric",
  psychic: "bg-psychic",
  rock: "bg-border",
  ice: "bg-water",
  dragon: "bg-accent-secondary",
  fairy: "bg-psychic",
};

// Pokemon type icons mapping (Lucide React)
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

interface NearbyPokemon {
  id: string;
  name: string;
  distance: number; // in meters
  type: string;
  cp: number;
  rarity: "common" | "uncommon" | "rare" | "legendary";
}

interface Pokemon {
  _id: string;
  name: string;
  description: string;
  spriteUrl: string;
  elementType: string;
  rarity: string;
  color: string;
  baseXp: number;
}

export interface Spawn {
  _id: string;
  pokemonId: Pokemon; // populated Pokémon
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  despawnAt: string;
  isActive: boolean;
  caughtBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// Calculate distance between two points (Haversine)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export default function PokeQuestMapPage() {
  const { setSpawns } = useStore();
  const { user } = useStore();
  const { location, permissionState } = useLocationTracker();

  const [nearbyPokemon, setNearbyPokemon] = useState<Spawn[]>([]);

  useEffect(() => {
    if (location && permissionState === "granted") {

      const fetchSpawns = async () => {
        try {
          console.log("Fetching spawns for location:", location);
          const response = await api.get("/api/spawn/user-spawns", {
            params: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
          });
          console.log("API response:", response.data);
          setSpawns(response.data.spawns);
          setNearbyPokemon(response.data.spawns);
        } catch (error) {
          console.error("Failed to fetch spawns", error);
        }
      };

      const loadSpawns = async () => {
        try {
          const { data } = await api.get("/api/spawn/generate-spawns");
        } catch (error) {
          console.error("Failed to load spawns", error);
        } finally {
          await fetchSpawns();
        }
      };

      loadSpawns();
    }
  }, [location, permissionState]);

  // Rarity colors
  const getRarityColor = (rarity: NearbyPokemon["rarity"]) => {
    switch (rarity) {
      case "common":
        return "text-text-secondary";
      case "uncommon":
        return "text-accent";
      case "rare":
        return "text-accent-secondary";
      case "legendary":
        return "text-accent-tertiary";
    }
  };

  return (
    <div className="min-h-screen bg-bg sky-gradient p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6 sm:mb-8 relative z-50">
        <AppNavbar user={user} />
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="font-accents text-3xl sm:text-4xl text-text-primary mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-text-secondary">
              Ready to catch some Pokémon today?
            </p>
          </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 h-[400px] sm:h-[500px] lg:h-[600px]">
            <MapComponent />
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Nearby Pokemon Card */}
            <div className="bg-surface rounded-2xl border-4 border-border shadow-lg p-4 sm:p-6 spawn-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-accents text-lg sm:text-xl text-text-primary font-bold">
                  Nearby Pokémon
                </h2>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/20 rounded-lg">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <span className="font-accents text-xs text-accent font-medium">
                    {nearbyPokemon.length}
                  </span>
                </div>
              </div>

              {permissionState !== "granted" ? (
                <div className="text-center py-8">
                  <MapPin
                    className="mx-auto mb-3 text-text-secondary"
                    size={48}
                  />
                  <p className="font-body text-sm text-text-secondary">
                    Enable location to see nearby Pokémon
                  </p>
                </div>
              ) : nearbyPokemon.length === 0 ? (
                <div className="text-center py-8">
                  <Compass
                    className="mx-auto mb-3 text-text-secondary animate-spin"
                    size={48}
                  />
                  <p className="font-body text-sm text-text-secondary">
                    Searching for Pokémon...
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                  {nearbyPokemon.map((pokemon, i) => {
                    const TypeIcon =
                      TYPE_ICONS[pokemon.pokemonId.elementType] || Star;
                    return (
                      <div
                        key={pokemon.pokemonId._id}
                        className="flex items-center justify-between p-3 bg-hover/50 hover:bg-hover rounded-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] group"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`w-10 h-10 rounded-full ${TYPE_COLORS[pokemon.pokemonId.elementType] || "bg-hover"} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                          >
                            <TypeIcon className="text-white" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-body text-sm text-text-primary font-semibold truncate">
                                {pokemon.pokemonId.name}
                              </span>
                              {pokemon.pokemonId.rarity === "legendary" && (
                                <Sparkles
                                  className={getRarityColor(
                                    pokemon.pokemonId.rarity,
                                  )}
                                  size={12}
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                              <span className="font-mono">
                                XP {pokemon.pokemonId.baseXp}
                              </span>
                              <span>•</span>
                              <span className="capitalize">
                                {pokemon.pokemonId.elementType}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="font-accents text-xs text-accent font-bold">
                            {formatDistance(
                              calculateDistance(
                                pokemon.location.coordinates[1],
                                pokemon.location.coordinates[0],
                                location!.latitude,
                                location!.longitude,
                              ),
                            )}
                          </span>
                          <span className="text-[9px] text-text-secondary">
                            away
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-6 sm:mt-8 text-center">
        <p className="font-body text-xs sm:text-sm text-text-secondary flex items-center justify-center gap-2">
          <Zap size={14} className="text-accent" />
          Powered by PokeQuest Engine v1.0 • Real-time GPS Tracking
        </p>
      </footer>

      {/* Custom Scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--color-hover);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-accent);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-accent-secondary);
        }
      `}</style>
    </div>
  );
}
