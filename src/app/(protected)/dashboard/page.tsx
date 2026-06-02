"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/context/i18n-context";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { IPSTrendChart } from "@/components/dashboard/ips-trend-chart";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { HighRiskPreview } from "@/components/dashboard/high-risk-preview";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/profile");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h2 className="text-xl font-bold">{t("dashboard.title")}</h2>
        <p className="text-sm text-muted-foreground">{t("dashboard.desc")}</p>
      </div>

      {/* Row 1: KPI Cards */}
      <KPICards />

      {/* Row 2: IPS Trend + High-Risk Preview */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IPSTrendChart />
        </div>
        <HighRiskPreview />
      </div>

      {/* Row 3: Key Analytical Findings */}
      <InsightsPanel />
    </div>
  );
}
