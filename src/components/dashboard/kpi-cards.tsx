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
      description: "Mahasiswa terdaftar aktif",
      iconBg: "bg-primary/20 dark:bg-primary/20",
      iconColor: "text-primary dark:text-primary",
      topBar: "from-primary to-primary/80",
      valueColor: "text-primary dark:text-primary",
    },
    {
      key: "predictedOnTime" as const,
      title: t("dashboard.kpiOnTime"),
      icon: CheckCircle2,
      description: "Lulus sesuai target",
      iconBg: "bg-secondary/20 dark:bg-secondary/20",
      iconColor: "text-secondary dark:text-secondary",
      topBar: "from-secondary to-secondary/80",
      valueColor: "text-secondary dark:text-secondary",
    },
    {
      key: "predictedLate" as const,
      title: t("dashboard.kpiLate") || "Prediksi Terlambat",
      icon: AlertTriangle,
      description: "Berisiko tidak tepat waktu",
      iconBg: "bg-destructive/20 dark:bg-destructive/20",
      iconColor: "text-destructive dark:text-destructive",
      topBar: "from-destructive to-destructive/80",
      valueColor: "text-destructive dark:text-destructive",
    },
    {
      key: "highRiskCount" as const,
      title: "Risiko Tinggi",
      icon: AlertCircle,
      description: "Memerlukan intervensi segera",
      iconBg: "bg-accent/20 dark:bg-accent/20",
      iconColor: "text-accent dark:text-accent",
      topBar: "from-accent to-accent/80",
      valueColor: "text-accent dark:text-accent",
    },
  ] as const;

  if (isLoading || !kpi) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const total = kpi.totalStudents;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cardMeta.map((card) => {
        const value = kpi[card.key];
        return (
          <Card key={card.title} className="relative overflow-hidden">
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
                {((value / total) * 100).toFixed(0)}% dari total
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
