"use client";
import { useStore } from "../utils/store/store";
import { UserState } from "../utils/slices/userSlice";
import { useEffect } from "react";

export default function ZustandUser(props: { user: UserState }) {
  const user = props.user;
  const { setUser } = useStore();

  useEffect(() => {
    console.log("State Hydrated");
    setUser(user);
  }, [user]);

  return null;
}
