"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { PopulationCharts } from "@/components/analytics/population-charts";
import { cn } from "@/lib/utils";
import { Users, AlertTriangle, TrendingDown, Activity, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/context/i18n-context";
import { useAsync } from "@/hooks/use-async";
import { fetchKPI } from "@/lib/api";

export default function AnalyticsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const { data: kpi, isLoading } = useAsync(fetchKPI);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/profile");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  const kpis = [
    {
      icon: Users,
      label: t("analytics.totalTitle"),
      value: kpi?.totalStudents ?? 0,
      sub: t("analytics.totalSub"),
      color: "text-blue-700 dark:text-blue-400",
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      icon: AlertTriangle,
      label: t("analytics.highRiskTitle"),
      value: kpi?.highRiskCount ?? 0,
      sub: `${kpi?.totalStudents ? (((kpi.highRiskCount) / kpi.totalStudents) * 100).toFixed(1) : 0}${t("analytics.highRiskSub")}`,
      color: "text-rose-700 dark:text-rose-400",
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
    },
    {
      icon: TrendingDown,
      label: t("analytics.degTitle"),
      value: "-", // Temporarily disabled since we removed mock data that tracks degradation exactly like this
      sub: t("analytics.degSub"),
      color: "text-orange-700 dark:text-orange-400",
      bg: "bg-orange-500/10 dark:bg-orange-500/20",
    },
    {
      icon: Activity,
      label: t("analytics.predTitle"),
      value: kpi?.predictedLate ?? 0,
      sub: `${kpi?.totalStudents ? (((kpi.predictedLate) / kpi.totalStudents) * 100).toFixed(1) : 0}${t("analytics.predSub")}`,
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">{t("analytics.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("analytics.desc")}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border p-4 bg-card/50">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-[250px] w-full" />
            </div>
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-[250px] w-full" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpis.map(({ icon: Icon, label, value, sub, color, bg }) => (
              <div
                key={label}
                className={cn("flex items-center gap-3 rounded-xl border p-4", bg)}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/60 dark:bg-black/20",
                  )}
                >
                  <Icon className={cn("h-4 w-4", color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={cn("text-xl font-bold tabular-nums", color)}>
                    {value}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <PopulationCharts />
        </>
      )}
    </div>
  );
}
