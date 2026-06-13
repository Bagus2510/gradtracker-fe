"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role !== "admin" && user.role !== "kaprodi") {
        router.replace("/");
      } else if (user.role === "kaprodi") {
        // Guard restricted routes
        const pathname = window.location.pathname;
        if (pathname.startsWith("/models") || pathname.startsWith("/predictions") || pathname.startsWith("/users")) {
          // If Kaprodi tries to access admin-only routes, push them back to dashboard
          router.replace("/dashboard");
        }
      }
    }
  }, [user, isLoading, router]);

  // Show nothing while hydrating / checking auth
  if (isLoading || !user) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
