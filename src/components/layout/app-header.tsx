"use client";

import { useRouter, usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/hooks/use-theme";
import { useI18n } from "@/context/i18n-context";
import {
  LayoutDashboard,
  BarChart3,
  UserCircle,
  Cpu,
  Moon,
  Sun,
  Bell,
  TrendingDown,
  Globe,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PageMeta {
  title: string;
  icon: LucideIcon;
}

const PAGE_META: Record<string, PageMeta> = {
  "/dashboard": { title: "Dashboard Overview", icon: LayoutDashboard },
  "/analytics": { title: "Predictive Analytics", icon: BarChart3 },
  "/profile": { title: "Student Profile", icon: UserCircle },
  "/simulation": { title: "Data & Simulation", icon: Cpu },
};

const ROLE_BADGE: Record<string, { label: string; classes: string }> = {
  admin: {
    label: "Admin",
    classes:
      "bg-primary/20 text-primary border border-primary dark:bg-primary/20 dark:text-primary dark:border-primary",
  },
  student: {
    label: "Mahasiswa",
    classes:
      "bg-secondary/20 text-secondary border border-secondary dark:bg-secondary/20 dark:text-secondary dark:border-secondary",
  },
};


export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { isDark, mounted, toggle } = useTheme();
  const { lang, setLang } = useI18n();

  const meta = PAGE_META[pathname];
  const Icon = meta?.icon;
  const roleBadge = user?.role ? ROLE_BADGE[user.role] : null;

  return (
    <header className="sticky top-0 z-10 flex h-[max(3.5rem,env(safe-area-inset-top))] shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md pt-[env(safe-area-inset-top)] [-webkit-app-region:drag]">
      <div className="[-webkit-app-region:no-drag] flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>

      {/* Page title */}
      <div className="flex items-center gap-2 [-webkit-app-region:no-drag]">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <h1 className="text-sm font-semibold">
          {meta?.title ?? "GradTracker"}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-1.5 [-webkit-app-region:no-drag]">
        {/* ── Language Toggle ── */}
        <button
          onClick={() => setLang(lang === "id" ? "en" : "id")}
          className="flex items-center gap-1.5 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground text-xs font-semibold"
          title="Toggle Language"
        >
          <Globe className="h-4 w-4" />
          {lang === "id" ? "ID" : "EN"}
        </button>

        {/* ── Dark Mode Toggle ── */}
        {mounted && (
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        )}

        {/* ── Role Badge ── */}
        {roleBadge && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge.classes}`}
          >
            {roleBadge.label}
          </span>
        )}
      </div>
    </header>
  );
}
