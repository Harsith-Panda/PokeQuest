import type { StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { api } from "../api/api";
import { AxiosResponse } from "axios";

// Defining Types of the pokemons and spawns and actions

export interface PokemonDetails {
  _id: string;
  name: string;
  color: string;
  spriteUrl: string;
  baseXp: number;
  description: string;
  elementType: string;
  rarity: string;
}

export interface Spawn {
  _id: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  pokemonId: PokemonDetails;
  despawnAt: string;
  isActive: boolean;
  distance?: number;
}

export interface SpawnState {
  spawns: Spawn[];

  setSpawns: (newSpawns: Spawn[]) => void;
}

// Actual Slice
export const createSpawnSlice: StateCreator<
  SpawnState,
  [],
  [["zustand/immer", never]],
  SpawnState
> = immer((set) => ({
  spawns: [],

  setSpawns: (newSpawns: Spawn[]) => {
    set((state) => {
      state.spawns = newSpawns;
    });
  },
}));
