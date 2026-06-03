"use client";

import { useState, useEffect } from "react";
import { fetchAllPredictions } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import type { PredictionLogEntry } from "@/types";
import { cn } from "@/lib/utils";
import { ScrollText, Loader2, BrainCircuit } from "lucide-react";

const RISK_BADGE = {
  High: "bg-destructive/20 text-destructive border-destructive",
  Medium: "bg-accent/20 text-accent border-accent",
  Low: "bg-secondary/20 text-secondary border-secondary",
} as const;

export default function PredictionsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<PredictionLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPredictions().then(setLogs).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Log Semua Prediksi</h2>
        <p className="text-sm text-muted-foreground">
          {logs.length} prediksi dari seluruh mahasiswa.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-muted-foreground">
          <ScrollText className="h-10 w-10 opacity-30" />
          <p className="text-sm">Belum ada prediksi yang dilakukan oleh mahasiswa.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Mahasiswa</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Waktu</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Prediksi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Model</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{log.studentName ?? "—"}</p>
                    <p className="font-mono text-xs text-muted-foreground">{log.studentNim}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("id-ID", {
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
                        log.prediction === "On-Time" ? "text-secondary" : "text-destructive",
                      )}
                    >
                      {log.prediction === "On-Time" ? "✓ Tepat Waktu" : "⚠ Terlambat"}
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
