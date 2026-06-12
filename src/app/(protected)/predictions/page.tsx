"use client";

import { useState, useEffect } from "react";
import { fetchAllPredictions } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/context/i18n-context";
import type { PredictionLogEntry } from "@/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollText, Loader2 } from "lucide-react";

const RISK_BADGE = {
  High: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
  Medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  Low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
} as const;

function obfuscateNIM(nim: string | null | undefined) {
  if (!nim) return "";
  return nim.substring(0, 2) + "*".repeat(Math.max(nim.length - 2, 0));
}

function obfuscateName(name: string | null | undefined) {
  if (!name) return "";
  return name.split(" ").map(word => {
    if (word.length <= 1) return word;
    return word.charAt(0) + "*".repeat(word.length - 1);
  }).join(" ");
}

export default function PredictionsPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [logs, setLogs] = useState<PredictionLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPredictions().then(setLogs).finally(() => setLoading(false));
  }, []);

  // Locale string for dates based on current lang
  const dateLocale = lang === "id" ? "id-ID" : "en-US";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{t("predictionsPage.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {logs.length} {t("predictionsPage.descCount")}
        </p>
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="border-b bg-muted/50 px-4 py-3 flex gap-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 px-4 py-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-muted-foreground">
          <ScrollText className="h-10 w-10 opacity-30" />
          <p className="text-sm">{t("predictionsPage.emptyStudent")}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t("predictionsPage.colStudent")}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t("predictionsPage.colTime")}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t("predictionsPage.colRisk")}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t("predictionsPage.colPrediction")}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t("predictionsPage.colConfidence")}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{t("predictionsPage.colModel")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{obfuscateName(log.studentName) || "—"}</p>
                    <p className="font-mono text-xs text-muted-foreground">{obfuscateNIM(log.studentNim)}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString(dateLocale, {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                        RISK_BADGE[log.riskLabel as keyof typeof RISK_BADGE] ?? "bg-muted",
                      )}
                    >
                      {log.riskLabel} ({log.riskScore})
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        log.prediction === "TEPAT" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
                      )}
                    >
                      {log.prediction === "TEPAT" ? `✓ ${t("predictionsPage.resultOnTime")}` : `⚠ ${t("predictionsPage.resultLate")}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {(log.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[120px]">
                    {log.modelName ?? "Rule-Based"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
