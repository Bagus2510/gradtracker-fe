"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/context/i18n-context";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { IPSTrendChart } from "@/components/dashboard/ips-trend-chart";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "kaprodi") router.replace("/");
  }, [user, router]);

  if (!user || (user.role !== "admin" && user.role !== "kaprodi")) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight">{t("dashboard.title")}</h2>
        <p className="text-muted-foreground mt-1">{t("dashboard.desc")}</p>
      </div>

      {/* Row 1: KPI Cards */}
      <KPICards />

      {/* Row 2: IPS Trend */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-3">
          <IPSTrendChart />
        </div>
      </div>
    </div>
  );
}
