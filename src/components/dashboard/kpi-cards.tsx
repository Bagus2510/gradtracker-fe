"use client";

import { Users, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import { fetchKPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useI18n } from "@/context/i18n-context";



function KPICardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 animate-pulse bg-muted" />
      <CardContent className="px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <Skeleton className="mt-4 h-1 w-full" />
        <Skeleton className="ml-auto mt-1 h-2.5 w-16" />
      </CardContent>
    </Card>
  );
}

export function KPICards() {
  const { t } = useI18n();
  const { data: kpi, isLoading } = useAsync(fetchKPI);

  const cardMeta = [
    {
      key: "totalStudents" as const,
      title: t("dashboard.kpiTotal"),
      icon: Users,
      description: t("dashboard.kpiDescRegistered"),
      iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      topBar: "from-blue-600 to-blue-400",
      valueColor: "text-blue-700 dark:text-blue-400",
    },
    {
      key: "predictedOnTime" as const,
      title: t("dashboard.kpiOnTime"),
      icon: CheckCircle2,
      description: t("dashboard.kpiDescOnTime"),
      iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      topBar: "from-emerald-600 to-emerald-400",
      valueColor: "text-emerald-700 dark:text-emerald-400",
    },
    {
      key: "predictedLate" as const,
      title: t("dashboard.kpiLate"),
      icon: AlertTriangle,
      description: t("dashboard.kpiDescLate"),
      iconBg: "bg-rose-500/10 dark:bg-rose-500/20",
      iconColor: "text-rose-600 dark:text-rose-400",
      topBar: "from-rose-600 to-rose-400",
      valueColor: "text-rose-700 dark:text-rose-400",
    },
    {
      key: "highRiskCount" as const,
      title: t("dashboard.kpiHighRisk"),
      icon: AlertCircle,
      description: t("dashboard.kpiDescHighRisk"),
      iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
      iconColor: "text-amber-600 dark:text-amber-400",
      topBar: "from-amber-600 to-amber-400",
      valueColor: "text-amber-700 dark:text-amber-400",
    },
  ] as const;

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const total = kpi?.totalStudents || 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cardMeta.map((card) => {
        const value = kpi ? kpi[card.key] : 0;
        return (
          <Card key={card.title} className="relative overflow-hidden backdrop-blur-xl bg-card/50 border-border/40 hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 ease-out shadow-lg">
            <CardContent className="px-5 pb-4 pt-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {card.title}
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-4xl font-bold tabular-nums leading-none",
                      card.valueColor,
                    )}
                  >
                    {value}
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    card.iconBg,
                  )}
                >
                  <card.icon className={cn("h-5 w-5", card.iconColor)} />
                </div>
              </div>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r transition-all duration-700",
                    card.topBar,
                  )}
                  style={{ width: `${(value / total) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-right text-[10px] text-muted-foreground">
                {total > 0 ? ((value / total) * 100).toFixed(0) : 0}{t("dashboard.kpiOfTotal")}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
