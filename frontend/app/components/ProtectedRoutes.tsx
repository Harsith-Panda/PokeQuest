"use client";
import { useEffect } from "react";
import { useStore } from "../utils/store/store";
import { useRouter } from "next/navigation";

export default function ProtectedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, fetchMe, loading } = useStore();
  const router = useRouter();

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <>{children}</>;
}
