"use client";

import { useState } from "react";
import {
  Loader2,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { predict } from "@/lib/api";
import type { PredictionResult } from "@/types";
import { useI18n } from "@/context/i18n-context";

// kept for reference — logic moved to lib/api.ts
function _unused(
  age: number,
  marital: string,
  employment: string,
  ips: number[],
  currentSem: number,
): PredictionResult {
  const validIPS = ips.slice(0, currentSem).filter((v) => !isNaN(v) && v > 0);
  if (validIPS.length === 0) {
    return {
      riskScore: 50,
      riskLabel: "Medium",
      prediction: "Late",
      confidence: 0.5,
      keyFactors: [],
    };
  }

  let score = 0;
  const factors: string[] = [];

  if (employment === "Employed") {
    score += 35;
    factors.push("Status bekerja meningkatkan risiko signifikan");
  }
  if (marital === "Married") {
    score += 15;
    factors.push("Status menikah berkorelasi dengan beban non-akademik");
  }
  if (age >= 25) {
    score += 20;
    factors.push("Usia di atas rata-rata angkatan");
  } else if (age >= 23) {
    score += 10;
  }

  if (validIPS.length >= 2) {
    const recent = validIPS[validIPS.length - 1];
    const prev = validIPS[validIPS.length - 2];
    const drop = prev - recent;
    if (drop > 0.5) {
      score += 25;
      factors.push(
        `Penurunan IPS ${drop.toFixed(2)} poin pada semester terakhir`,
      );
    } else if (drop > 0.3) {
      score += 10;
    }
  }

  const avgIPS = validIPS.reduce((a, b) => a + b, 0) / validIPS.length;
  if (avgIPS < 2.5) {
    score += 15;
    factors.push("Rata-rata IPS di bawah 2.50");
  } else if (avgIPS < 2.8) {
    score += 5;
  }

  score = Math.min(score, 99);
  const riskLabel = score >= 65 ? "High" : score >= 40 ? "Medium" : "Low";
  const prediction = score >= 50 ? "Late" : "On-Time";
  const confidence = 0.6 + Math.random() * 0.25;
  if (factors.length === 0)
    factors.push("Performa akademik stabil dan konsisten");

  return {
    riskScore: score,
    riskLabel,
    prediction,
    confidence,
    keyFactors: factors,
  };
}

const riskStyle = {
  Low: {
    text: "text-secondary dark:text-secondary",
    bg: "bg-secondary/10 dark:bg-secondary/20",
    border: "border-secondary dark:border-secondary",
    bar: "bg-secondary",
  },
  Medium: {
    text: "text-accent dark:text-accent",
    bg: "bg-accent/10 dark:bg-accent/20",
    border: "border-accent dark:border-accent",
    bar: "bg-accent",
  },
  High: {
    text: "text-destructive dark:text-destructive",
    bg: "bg-destructive/10 dark:bg-destructive/20",
    border: "border-destructive dark:border-destructive",
    bar: "bg-destructive",
  },
};

export function PredictionForm() {
  const { t } = useI18n();
  const [age, setAge] = useState("");
  const [marital, setMarital] = useState<"Single" | "Married" | "">("");
  const [employment, setEmployment] = useState<"Employed" | "Unemployed" | "">(
    "",
  );
  const [currentSem, setCurrentSem] = useState("8");
  const [ips, setIps] = useState<string[]>(Array(8).fill(""));
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleIpsChange = (index: number, value: string) => {
    const updated = [...ips];
    updated[index] = value;
    setIps(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const semCount = parseInt(currentSem);
    const ipsNumbers = ips.slice(0, semCount).map((v) => parseFloat(v) || 0);
    const res = await predict({
      age: parseInt(age) || 22,
      maritalStatus: (marital || "Single") as "Single" | "Married",
      employmentStatus: (employment || "Unemployed") as
        | "Employed"
        | "Unemployed",
      ips: ipsNumbers,
      currentSemester: semCount,
    });
    setResult(res);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulasi Prediksi Kelulusan</CardTitle>
        <CardDescription>
          Masukkan data akademik dan demografi untuk mendapatkan prediksi risiko
          keterlambatan kelulusan secara real-time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Demographics */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Data Demografi
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="age">Usia</Label>
                <Input
                  id="age"
                  type="number"
                  min={17}
                  max={35}
                  placeholder="22"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status Pernikahan</Label>
                <Select
                  value={marital}
                  onValueChange={(v) => setMarital(v as "Single" | "Married")}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Belum Menikah</SelectItem>
                    <SelectItem value="Married">Sudah Menikah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status Pekerjaan</Label>
                <Select
                  value={employment}
                  onValueChange={(v) =>
                    setEmployment(v as "Employed" | "Unemployed")
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unemployed">Tidak Bekerja</SelectItem>
                    <SelectItem value="Employed">Bekerja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Academic */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                IPS per Semester
              </p>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="current-sem"
                  className="text-xs text-muted-foreground"
                >
                  Semester aktif:
                </Label>
                <Select
                  value={currentSem}
                  onValueChange={(v) => v && setCurrentSem(v)}
                >
                  <SelectTrigger className="h-7 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        Sem {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {Array.from({ length: parseInt(currentSem) }, (_, i) => (
                <div key={i} className="space-y-1.5">
                  <Label
                    htmlFor={`ips-${i}`}
                    className="text-xs text-muted-foreground"
                  >
                    Semester {i + 1}
                  </Label>
                  <Input
                    id={`ips-${i}`}
                    type="number"
                    step="0.01"
                    min={0}
                    max={4}
                    placeholder="0.00"
                    value={ips[i]}
                    onChange={(e) => handleIpsChange(i, e.target.value)}
                    className="text-sm"
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full text-sm font-semibold"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Memproses Model..." : "Hitung Prediksi Risiko"}
          </Button>
        </form>

        {/* Result */}
        {result && (
          <div
            className={cn(
              "mt-6 rounded-2xl border p-5 space-y-4 transition-all",
              riskStyle[result.riskLabel].bg,
              riskStyle[result.riskLabel].border,
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="font-bold">Hasil Prediksi</p>
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold",
                  riskStyle[result.riskLabel].text,
                )}
              >
                {result.prediction === "On-Time" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {result.prediction === "On-Time" ? "TEPAT WAKTU" : "TERLAMBAT"}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-background/70 p-3 text-center backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Risk Score
                </p>
                <p
                  className={cn(
                    "mt-1 text-3xl font-bold tabular-nums",
                    riskStyle[result.riskLabel].text,
                  )}
                >
                  {result.riskScore}
                </p>
                <div className="mx-auto mt-1.5 h-1 w-12 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      riskStyle[result.riskLabel].bar,
                    )}
                    style={{ width: `${result.riskScore}%` }}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-background/70 p-3 text-center backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Level Risiko
                </p>
                <p
                  className={cn(
                    "mt-2 text-xl font-bold",
                    riskStyle[result.riskLabel].text,
                  )}
                >
                  {result.riskLabel}
                </p>
              </div>
              <div className="rounded-xl bg-background/70 p-3 text-center backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Confidence
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums">
                  {(result.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Key factors */}
            {result.keyFactors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Faktor Penentu:
                </p>
                <ul className="space-y-1.5">
                  {result.keyFactors.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      {result.prediction === "On-Time" ? (
                        <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
                      ) : (
                        <TrendingDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                      )}
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
