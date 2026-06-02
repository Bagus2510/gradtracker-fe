"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  BarChart3,
  UserCircle,
  Cpu,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/context/i18n-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    {
      href: "/dashboard",
      label: t("sidebar.dashboard"),
      icon: LayoutDashboard,
      adminOnly: true,
    },
    {
      href: "/analytics",
      label: t("sidebar.analytics"),
      icon: BarChart3,
      adminOnly: true,
    },
    {
      href: "/profile",
      label: t("sidebar.profile"),
      icon: UserCircle,
      adminOnly: false,
    },
    {
      href: "/simulation",
      label: t("sidebar.simulation"),
      icon: Cpu,
      adminOnly: false,
    },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === "admin",
  );

  const initials =
    user?.name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "?";

  return (
    <Sidebar>
      {/* ── Brand ── */}
      <SidebarHeader className="px-4 pb-5 pt-[max(env(safe-area-inset-top),1.25rem)] [-webkit-app-region:drag]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-extrabold text-sidebar-foreground">
              GradTracker
            </p>
            <p className="text-xs font-medium capitalize text-sidebar-foreground/60">
              {user?.role} panel
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="opacity-20" />

      {/* ── Navigation ── */}
      <SidebarContent className="px-2 py-3">
        <SidebarMenu className="flex flex-col gap-2">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={isActive}
                  className="flex items-center gap-4 rounded-xl px-4 py-6 text-base font-semibold text-sidebar-foreground/70 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-md hover:scale-[1.02] active:scale-95"
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* ── User footer ── */}
      <SidebarFooter className="px-2 pb-3">
        <SidebarSeparator className="mb-3 opacity-20" />
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-8 w-8 ring-2 ring-sidebar-accent">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-xs font-bold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate leading-tight">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {user?.name}
            </p>
            <p className="truncate text-[10px] capitalize text-sidebar-foreground/50">
              {user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-1.5 text-sidebar-foreground/40 transition-colors hover:bg-destructive hover:text-destructive"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
