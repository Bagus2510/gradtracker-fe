"use client";

import { TrendingDown, Briefcase, Users, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { mockStudents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useI18n } from "@/context/i18n-context";

// ── Compute real values from data ──────────────────────────────────────────────
const degradationCount = mockStudents.filter((s) => s.hasIPSDegradation).length;
const highRiskCount = mockStudents.filter((s) => s.riskLabel === "High").length;

const employedStudents = mockStudents.filter(
  (s) => s.employmentStatus === "Employed",
);
const employedLateRate = Math.round(
  (employedStudents.filter((s) => s.graduationStatus === "Late").length /
    employedStudents.length) *
    100,
);

const ageRisk = mockStudents.filter((s) => s.age >= 25);
const ageRiskLateRate = Math.round(
  (ageRisk.filter((s) => s.graduationStatus === "Late").length /
    (ageRisk.length || 1)) *
    100,
);


export function InsightsPanel() {
  const { t } = useI18n();

  const insights = [
    {
      icon: TrendingDown,
      title: t("dashboard.f1Title"),
      value: `${degradationCount} mahasiswa`,
      description: t("dashboard.f1Desc"),
      iconBg: "bg-destructive/20 dark:bg-destructive/20",
      iconColor: "text-destructive dark:text-destructive",
      borderColor: "border-l-destructive",
      valueColor: "text-destructive dark:text-destructive",
    },
    {
      icon: Briefcase,
      title: t("dashboard.f2Title"),
      value: `${employedLateRate}% terlambat`,
      description: `${employedStudents.length} mahasiswa bekerja — risiko jauh lebih tinggi dari yang tidak bekerja`,
      iconBg: "bg-accent/20 dark:bg-accent/20",
      iconColor: "text-accent dark:text-accent",
      borderColor: "border-l-accent",
      valueColor: "text-accent dark:text-accent",
    },
    {
      icon: Users,
      title: t("dashboard.f3Title"),
      value: `${ageRiskLateRate}% terlambat`,
      description: `${ageRisk.length} mahasiswa berusia ≥25 tahun — korelasi kuat dengan keterlambatan`,
      iconBg: "bg-secondary/10 dark:bg-secondary/10",
      iconColor: "text-secondary dark:text-secondary",
      borderColor: "border-l-orange-500",
      valueColor: "text-secondary dark:text-secondary",
    },
    {
      icon: AlertCircle,
      title: t("dashboard.f4Title"),
      value: `${highRiskCount} mahasiswa`,
      description: t("dashboard.f4Desc"),
      iconBg: "bg-primary/20 dark:bg-primary/20",
      iconColor: "text-primary dark:text-primary",
      borderColor: "border-l-primary",
      valueColor: "text-primary dark:text-primary",
    },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">{t("dashboard.findingsTitle")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("dashboard.findingsDesc")}
          </p>
        </div>
        <span className="hidden rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary dark:border-primary dark:bg-primary/20 dark:text-primary sm:inline-flex">
          BI Insights
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {insights.map((insight) => (
          <Card
            key={insight.title}
            className="transition-shadow hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    insight.iconBg,
                  )}
                >
                  <insight.icon className={cn("h-4 w-4", insight.iconColor)} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {insight.title}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 text-xl font-bold leading-tight",
                      insight.valueColor,
                    )}
                  >
                    {insight.value}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
