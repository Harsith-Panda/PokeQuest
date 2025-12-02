import type { StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { api } from "../api/api";
import { AxiosResponse } from "axios";

// Format for location followed : [lng, lat] (Consistent all over the codebase)

type GeoPoint = {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
  lastUpdated: string | null;
};

type Stats = {
  totalCaptures: number;
  xp: number;
  level: number;
};

export type UserState = {
  _id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  lastLocation: GeoPoint | null;
  stats: Stats;
  inventoryId: string;
};

type userActions = {
  logout: () => Promise<void>;
  signUp: (data: {
    username: string;
    email: string;
    password: string;
  }) => Promise<AxiosResponse>;
  login: (data: { email: string; password: string }) => Promise<AxiosResponse>;
  fetchMe: () => Promise<void>;
  setUser: (user: UserState) => void;
  updateLocation: (id: string, location: [number, number]) => Promise<void>;
};

export type userSlice = {
  loading: boolean;
  user: UserState | null;
} & userActions;

export const createUserSlice: StateCreator<
  userSlice,
  [],
  [["zustand/immer", never]],
  userSlice
> = immer((set) => ({
  loading: false,
  user: null,
  logout: async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    await api.post("/api/auth/logout");
    return set({ user: null });
  },
  signUp: async (data: {
    username: string;
    email: string;
    password: string;
  }) => {
    return await api.post("/api/auth/signup", { ...data });
  },
  login: async (data: { email: string; password: string }) => {
    try {
      const res = await api.post("/api/auth/login", { ...data });

      const user = res.data.user;

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);

      set({ user: user });

      return res;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  fetchMe: async () => {
    set({ loading: true });

    try {
      const res = await api.get("/api/auth/me");
      set({ user: res.data.data });
    } catch (e) {
      set({ user: null });
    } finally {
      set({ loading: false }); // ← CRUCIAL
    }
  },
  setUser: (newUser: UserState) => {
    set(() => ({
      user: structuredClone(newUser), // works in modern browsers/node
    }));
  },
  updateLocation: async (
    id: string | undefined,
    location: [number, number],
  ) => {
    await api.put("/api/user/update-location", {
      id: id,
      location: location,
    });
    set((state) => ({ ...state.user, lastLocation: location }));
  },
}));
