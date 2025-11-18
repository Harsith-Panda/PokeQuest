import { create } from "zustand";
import { userSlice, createUserSlice } from "../slices/userSlice";

export const useStore = create<userSlice>((...a) => ({
  ...createUserSlice(...a),
}));
