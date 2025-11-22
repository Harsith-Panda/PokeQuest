"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../utils/api/api";
import { useStore } from "../utils/store/store";
import AuthLoading from "./AuthLoading";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { setUser } = useStore();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
      router.replace("/login");
      return;
    }

    api
      .get("/api/auth/me")
      .then((response) => {
        setLoading(false);
        setUser(response.data.data);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (loading) return <AuthLoading variant="full" />;

  return <>{children}</>;
}
