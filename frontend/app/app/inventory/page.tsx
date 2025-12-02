"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/app/utils/store/store";
import { api } from "@/app/utils/api/api";
import AppNavbar from "@/app/components/AppNavbar";
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
  Calendar,
  TrendingUp,
  Package,
  Search,
  Filter,
  SortAsc,
  Loader2,
  AlertCircle,
} from "lucide-react";

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

// Type colors
const TYPE_COLORS: Record<string, string> = {
  normal: "bg-hover border-hover",
  fire: "bg-fire/20 border-fire",
  water: "bg-water/20 border-water",
  grass: "bg-grass/20 border-grass",
  electric: "bg-electric/20 border-electric",
  psychic: "bg-psychic/20 border-psychic",
  rock: "bg-border border-border",
  ice: "bg-water/20 border-water",
  dragon: "bg-accent-secondary/20 border-accent-secondary",
  fairy: "bg-psychic/20 border-psychic",
};

// Rarity colors
const RARITY_COLORS: Record<string, string> = {
  common: "text-text-secondary",
  uncommon: "text-accent",
  rare: "text-accent-secondary",
  legendary: "text-accent-tertiary",
};

const RARITY_BG: Record<string, string> = {
  common: "bg-text-secondary/10",
  uncommon: "bg-accent/10",
  rare: "bg-accent-secondary/10",
  legendary: "bg-accent-tertiary/10",
};

interface PokemonType {
  _id: string;
  name: string;
  description: string;
  spriteUrl: string;
  elementType: string;
  rarity: string;
  color: string;
  baseXp: number;
}

interface CapturedPokemon {
  _id?: string;
  pokemonTypeId: PokemonType;
  capturedAt: string;
  stats?: any;
}

interface Inventory {
  _id: string;
  userId: string;
  pokemon: CapturedPokemon[];
  createdAt: string;
  updatedAt: string;
}

type SortOption = "recent" | "name" | "rarity" | "type";
type FilterOption = "all" | string; // 'all' or specific element type

export default function InventoryPage() {
  const router = useRouter();
  const { user } = useStore();

  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterType, setFilterType] = useState<FilterOption>("all");

  // Fetch inventory
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/spawn/getinventory");
        console.log(response.data.inventory)
        setInventory(response.data.inventory);
      } catch (err: any) {
        console.error("Failed to fetch inventory:", err);
        setError(err?.response?.data?.message || "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInventory();
    }
  }, [user]);

  // Filter and sort pokemon
  const getFilteredAndSortedPokemon = (): CapturedPokemon[] => {
    if (!inventory?.pokemon) return [];

    let filtered = [...inventory.pokemon];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.pokemonTypeId.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(
        (p) => p.pokemonTypeId.elementType === filterType
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return (
            new Date(b.capturedAt).getTime() -
            new Date(a.capturedAt).getTime()
          );
        case "name":
          return a.pokemonTypeId.name.localeCompare(b.pokemonTypeId.name);
        case "rarity":
          const rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
          return (
            (rarityOrder[a.pokemonTypeId.rarity as keyof typeof rarityOrder] ||
              99) -
            (rarityOrder[b.pokemonTypeId.rarity as keyof typeof rarityOrder] ||
              99)
          );
        case "type":
          return a.pokemonTypeId.elementType.localeCompare(
            b.pokemonTypeId.elementType
          );
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredPokemon = getFilteredAndSortedPokemon();

  // Get unique types for filter
  const uniqueTypes = Array.from(
    new Set(inventory?.pokemon.map((p) => p.pokemonTypeId.elementType) || [])
  );

  // Statistics
  const totalCaught = inventory?.pokemon.length || 0;
  const uniqueCaught = new Set(
    inventory?.pokemon.map((p) => p.pokemonTypeId._id) || []
  ).size;
  const totalXp =
    inventory?.pokemon.reduce(
      (sum, p) => sum + (p.pokemonTypeId.baseXp || 0),
      0
    ) || 0;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg sky-gradient flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-accent" size={48} />
          <p className="font-accents text-text-primary">Loading inventory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg sky-gradient flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl border-4 border-accent-red p-8 max-w-md text-center">
          <AlertCircle className="mx-auto mb-4 text-accent-red" size={48} />
          <h2 className="font-accents text-xl text-text-primary mb-2">
            Error Loading Inventory
          </h2>
          <p className="font-body text-sm text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => router.push("/map")}
            className="px-6 py-2 bg-accent text-text-primary font-accents rounded-xl hover:bg-accent/90 transition-colors"
          >
            Return to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg sky-gradient p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6 sm:mb-8 relative z-50">
        <AppNavbar user={user} />
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {/* Page Title & Stats */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="text-accent" size={32} />
            <h1 className="font-logo text-3xl sm:text-4xl text-text-primary">
              My Inventory
            </h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface rounded-2xl border-4 border-border shadow-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                  <Zap className="text-accent" size={24} />
                </div>
                <div>
                  <div className="font-body text-xs text-text-secondary">
                    Total Caught
                  </div>
                  <div className="font-accents text-2xl font-bold text-text-primary">
                    {totalCaught}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-2xl border-4 border-border shadow-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent-secondary/20 rounded-full flex items-center justify-center">
                  <Star className="text-accent-secondary" size={24} />
                </div>
                <div>
                  <div className="font-body text-xs text-text-secondary">
                    Unique Species
                  </div>
                  <div className="font-accents text-2xl font-bold text-text-primary">
                    {uniqueCaught}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-2xl border-4 border-border shadow-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent-tertiary/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-accent-tertiary" size={24} />
                </div>
                <div>
                  <div className="font-body text-xs text-text-secondary">
                    Total XP Value
                  </div>
                  <div className="font-accents text-2xl font-bold text-text-primary">
                    {totalXp.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter, Sort Bar */}
        <div className="bg-surface rounded-2xl border-4 border-border shadow-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                size={20}
              />
              <input
                type="text"
                placeholder="Search Pokemon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-hover border-2 border-border rounded-xl font-body text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Filter by Type */}
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                size={20}
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-4 py-2 bg-hover border-2 border-border rounded-xl font-accents text-sm text-text-primary focus:outline-none focus:border-accent transition-colors cursor-pointer appearance-none"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <SortAsc
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
                size={20}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="pl-10 pr-4 py-2 bg-hover border-2 border-border rounded-xl font-accents text-sm text-text-primary focus:outline-none focus:border-accent transition-colors cursor-pointer appearance-none"
              >
                <option value="recent">Recent First</option>
                <option value="name">Name (A-Z)</option>
                <option value="rarity">Rarity</option>
                <option value="type">Type</option>
              </select>
            </div>
          </div>

          {/* Active filters info */}
          {(searchQuery || filterType !== "all") && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="font-body text-text-secondary">
                Showing {filteredPokemon.length} of {totalCaught} Pokémon
              </span>
              {(searchQuery || filterType !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("all");
                  }}
                  className="font-accents text-accent hover:text-accent-secondary transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pokemon Grid */}
        {filteredPokemon.length === 0 ? (
          <div className="bg-surface rounded-2xl border-4 border-border shadow-lg p-12 text-center">
            <Package className="mx-auto mb-4 text-text-secondary" size={64} />
            <h3 className="font-accents text-xl text-text-primary mb-2">
              {searchQuery || filterType !== "all"
                ? "No Pokémon Found"
                : "No Pokémon Caught Yet"}
            </h3>
            <p className="font-body text-sm text-text-secondary mb-6">
              {searchQuery || filterType !== "all"
                ? "Try adjusting your search or filters"
                : "Go explore the map and catch your first Pokémon!"}
            </p>
            {!(searchQuery || filterType !== "all") && (
              <button
                onClick={() => router.push("/map")}
                className="px-6 py-3 bg-gradient-to-r from-accent to-accent-secondary text-text-primary font-accents font-bold rounded-xl border-3 border-text-primary shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                Go to Map
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPokemon.map((pokemon, index) => {
              const TypeIcon =
                TYPE_ICONS[pokemon.pokemonTypeId.elementType] || Star;
              return (
                <div
                  key={`${pokemon.pokemonTypeId._id}-${index}`}
                  className="bg-surface rounded-2xl border-4 border-border shadow-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
                >
                  {/* Pokemon Icon */}
                  <div
                    className={`relative h-40 flex items-center justify-center ${TYPE_COLORS[pokemon.pokemonTypeId.elementType] || "bg-hover"}`}
                  >
                    <TypeIcon
                      className="text-white opacity-90 group-hover:scale-110 transition-transform"
                      size={80}
                    />

                    {/* Rarity Badge */}
                    <div className="absolute top-2 right-2">
                      <div
                        className={`px-2 py-1 ${RARITY_BG[pokemon.pokemonTypeId.rarity]} border-2 border-border rounded-lg`}
                      >
                        <span
                          className={`font-accents text-[10px] font-bold uppercase ${RARITY_COLORS[pokemon.pokemonTypeId.rarity]}`}
                        >
                          {pokemon.pokemonTypeId.rarity}
                        </span>
                      </div>
                    </div>

                    {/* Legendary sparkle */}
                    {pokemon.pokemonTypeId.rarity === "legendary" && (
                      <Sparkles
                        className="absolute top-2 left-2 text-accent-tertiary animate-pulse"
                        size={20}
                      />
                    )}
                  </div>

                  {/* Pokemon Info */}
                  <div className="p-4">
                    <h3 className="font-accents text-lg font-bold text-text-primary mb-1 truncate">
                      {pokemon.pokemonTypeId.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-hover rounded text-[10px] font-accents text-text-secondary uppercase">
                        {pokemon.pokemonTypeId.elementType}
                      </span>
                      <span className="px-2 py-0.5 bg-hover rounded text-[10px] font-accents text-text-secondary">
                        {pokemon.pokemonTypeId.baseXp} XP
                      </span>
                    </div>

                    {/* Captured date */}
                    <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                      <Calendar size={12} />
                      <span className="font-body">
                        Caught {formatDate(pokemon.capturedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-8 text-center">
        <p className="font-body text-xs sm:text-sm text-text-secondary">
          Keep catching to complete your collection!
        </p>
      </footer>
    </div>
  );
}