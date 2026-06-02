"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { PopulationCharts } from "@/components/analytics/population-charts";
import { HighRiskTable } from "@/components/analytics/high-risk-table";
import { mockStudents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Users, AlertTriangle, TrendingDown, BookOpen, Activity } from "lucide-react";
import { useI18n } from "@/context/i18n-context";

// ── Analytics summary stats ───────────────────────────────────────────────────
const programs = Array.from(new Set(mockStudents.map((s) => s.program)));
const highRiskCount = mockStudents.filter((s) => s.riskLabel === "High").length;
const degradationCount = mockStudents.filter((s) => s.hasIPSDegradation).length;
const latePredCount = mockStudents.filter(
  (s) => s.graduationStatus === "Late",
).length;

export default function AnalyticsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();

  const kpis = [
    {
      icon: Users,
      label: t("analytics.totalTitle"),
      value: mockStudents.length,
      sub: `${programs.length} ${t("analytics.totalSub")}`,
      color: "text-primary dark:text-primary",
      bg: "bg-primary/20",
    },
    {
      icon: AlertTriangle,
      label: t("analytics.highRiskTitle"),
      value: highRiskCount,
      sub: `${((highRiskCount / mockStudents.length) * 100).toFixed(1)}% ${t("analytics.highRiskSub")}`,
      color: "text-destructive dark:text-destructive",
      bg: "bg-destructive/20",
    },
    {
      icon: TrendingDown,
      label: t("analytics.degTitle"),
      value: degradationCount,
      sub: t("analytics.degSub"),
      color: "text-orange-600 dark:text-orange-500",
      bg: "bg-orange-500/20",
    },
    {
      icon: Activity,
      label: t("analytics.predTitle"),
      value: latePredCount,
      sub: `${((latePredCount / mockStudents.length) * 100).toFixed(1)}% ${t("analytics.predSub")}`,
      color: "text-accent dark:text-accent",
      bg: "bg-accent/20",
    },
  ];

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/profile");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">{t("analytics.title")}</h2>
        <p className="text-sm text-muted-foreground">
          Distribusi populasi mahasiswa dan daftar mahasiswa berisiko tinggi
          dengan indikator degradasi IPS.
        </p>
      </div>

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

      {/* High-risk table */}
      <HighRiskTable />
    </div>
  );
}
