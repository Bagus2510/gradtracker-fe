"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace(user.role === "admin" ? "/dashboard" : "/profile");
    } else {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  return null;
}
