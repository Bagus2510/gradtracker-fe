"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockStudents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useI18n } from "@/context/i18n-context";

const topHighRisk = mockStudents
  .filter((s) => s.riskLabel === "High")
  .sort((a, b) => b.riskScore - a.riskScore)
  .slice(0, 6);

export function HighRiskPreview() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/20 dark:bg-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive dark:text-destructive" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">
              Perlu Perhatian Segera
            </CardTitle>
            <CardDescription className="text-xs">
              {mockStudents.filter((s) => s.riskLabel === "High").length}{" "}
              mahasiswa High Risk terdeteksi
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div className="divide-y">
          {topHighRisk.map((student, i) => {
            const initials = student.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={student.id}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50"
              >
                {/* Rank */}
                <span className="w-4 shrink-0 text-xs font-bold tabular-nums text-muted-foreground/50">
                  {i + 1}
                </span>

                {/* Avatar */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-xs font-bold text-destructive dark:bg-destructive/20 dark:text-destructive">
                  {initials}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {student.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {student.nim}
                    </p>
                    {student.hasIPSDegradation && (
                      <span className="flex items-center gap-0.5 text-[10px] font-medium text-destructive">
                        <TrendingDown className="h-2.5 w-2.5" />
                        Degradasi
                      </span>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold tabular-nums text-destructive dark:text-destructive">
                    {student.riskScore}
                  </p>
                  <p className="text-[10px] text-muted-foreground">/100</p>
                </div>

                {/* Mini bar */}
                <div className="hidden h-1.5 w-12 shrink-0 overflow-hidden rounded-full bg-muted sm:block">
                  <div
                    className="h-full rounded-full bg-destructive"
                    style={{ width: `${student.riskScore}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className={cn("border-t p-3")}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/analytics")}
          >
            Lihat semua di Predictive Analytics
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
