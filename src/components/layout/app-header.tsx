"use client";

import { usePathname } from "next/navigation";
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
  Globe,
  Users,
  BrainCircuit,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

interface PageMeta {
  titleKey: string;
  icon: LucideIcon;
}

const PAGE_META_CONFIG: Record<string, PageMeta> = {
  "/dashboard":    { titleKey: "header.pageDashboard",    icon: LayoutDashboard },
  "/students":     { titleKey: "header.pageStudents",     icon: Users           },
  "/analytics":    { titleKey: "header.pageAnalytics",    icon: BarChart3       },
  "/models":       { titleKey: "header.pageModels",       icon: BrainCircuit    },
  "/predictions":  { titleKey: "header.pagePredictions",  icon: ScrollText      },
  "/profile":      { titleKey: "header.pageProfile",      icon: UserCircle      },
  "/simulation":   { titleKey: "header.pageSimulation",   icon: Cpu             },
};

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { isDark, mounted, toggle } = useTheme();
  const { lang, setLang, t } = useI18n();

  const metaConfig = PAGE_META_CONFIG[pathname];
  const Icon = metaConfig?.icon;
  const pageTitle = metaConfig ? t(metaConfig.titleKey) : "GradTracker";

  const roleBadgeLabel = user?.role === "admin"
    ? t("header.roleBadgeAdmin")
    : t("header.roleBadgeStudent");

  const roleBadgeClasses = user?.role === "admin"
    ? "bg-primary/20 text-primary border border-primary dark:bg-primary/20 dark:text-primary dark:border-primary"
    : "bg-secondary/20 text-secondary border border-secondary dark:bg-secondary/20 dark:text-secondary dark:border-secondary";

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
          {pageTitle}
        </h1>
      </div>

      <div className="ml-auto flex items-center gap-1.5 [-webkit-app-region:no-drag]">
        {/* ── Language Toggle ── */}
        <button
          onClick={() => setLang(lang === "id" ? "en" : "id")}
          className="flex items-center gap-1.5 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground text-xs font-semibold cursor-pointer"
          title="Toggle Language"
        >
          <Globe className="h-4 w-4" />
          {lang === "id" ? "ID" : "EN"}
        </button>

        {/* ── Dark Mode Toggle ── */}
        {mounted && (
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
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
        {user?.role && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeClasses}`}>
            {roleBadgeLabel}
          </span>
        )}
      </div>
    </header>
  );
}
