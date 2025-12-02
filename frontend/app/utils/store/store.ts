import { create } from "zustand";
import { userSlice, createUserSlice } from "../slices/userSlice";
import { SpawnState, createSpawnSlice } from "../slices/spawnSlice";

export const useStore = create<userSlice & SpawnState>((...a) => ({
  ...createUserSlice(...a),
  ...createSpawnSlice(...a),
}));
