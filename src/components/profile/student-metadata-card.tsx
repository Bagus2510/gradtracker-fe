"use client";

import {
  User2,
  Calendar,
  Briefcase,
  Heart,
  BookOpen,
  GraduationCap,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Student } from "@/types";
import { useI18n } from "@/context/i18n-context";

const riskColors: Record<
  Student["riskLabel"],
  { text: string; bg: string; bar: string }
> = {
  Low: {
    text: "text-secondary dark:text-secondary",
    bg: "bg-secondary/20 dark:bg-secondary/20",
    bar: "bg-secondary",
  },
  Medium: {
    text: "text-accent dark:text-accent",
    bg: "bg-accent/20 dark:bg-accent/20",
    bar: "bg-accent",
  },
  High: {
    text: "text-destructive dark:text-destructive",
    bg: "bg-destructive/20 dark:bg-destructive/20",
    bar: "bg-destructive",
  },
};

export function StudentMetadataCard({ student }: { student: Student }) {
  const { t } = useI18n();

  const fields = [
    {
      icon: User2,
      label: t("profile.gender"),
      value: student.gender === "L" ? "Laki-laki" : "Perempuan",
    },
    { icon: Calendar, label: t("profile.age"), value: `${student.age} tahun` },
    {
      icon: Heart,
      label: t("profile.marital"),
      value:
        student.maritalStatus === "Single" ? "Belum Menikah" : "Sudah Menikah",
    },
    {
      icon: Briefcase,
      label: t("profile.employment"),
      value:
        student.employmentStatus === "Employed" ? "Bekerja" : "Tidak Bekerja",
    },
    { icon: BookOpen, label: "Program Studi", value: student.program },
    {
      icon: GraduationCap,
      label: t("profile.year"),
      value: student.entryYear.toString(),
    },
  ];

  const risk = riskColors[student.riskLabel];
  const initials = student.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="overflow-hidden">
      {/* ── Gradient header ── */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold text-white backdrop-blur-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white truncate">
              {student.name}
            </h3>
            <p className="font-mono text-sm text-white/70">{student.nim}</p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
              risk.bg,
              risk.text,
            )}
          >
            {student.riskLabel} Risk
          </span>
        </div>
      </div>

      <CardContent className="p-6">
        {/* 2. Additional Meta (fields) */}
        <div className="grid grid-cols-2 gap-4">
          {fields.map((f, i) => (
            <div key={f.label} className="flex items-start gap-2.5">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                <f.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {f.label}
                </dt>
                <dd className="text-sm font-medium">{f.value}</dd>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-muted/60 p-4">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              IPK
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {student.ipk.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Risk Score
            </p>
            <p
              className={cn("mt-1 text-2xl font-bold tabular-nums", risk.text)}
            >
              {student.riskScore}
              <span className="text-sm font-normal text-muted-foreground">
                /100
              </span>
            </p>
            {/* Progress bar */}
            <div className="mx-auto mt-1.5 h-1 w-16 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", risk.bar)}
                style={{ width: `${student.riskScore}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              ${t("profile.prediction")}
            </p>
            <p
              className={cn(
                "mt-1 text-sm font-bold",
                student.graduationStatus === "On-Time"
                  ? "text-secondary"
                  : "text-destructive",
              )}
            >
              {student.graduationStatus === "On-Time"
                ? t("profile.onTime")
                : "Terlambat"}
            </p>
          </div>
        </div>

        {/* IPS degradation warning */}
        {student.hasIPSDegradation && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 dark:border-destructive dark:bg-destructive/20">
            <TrendingDown className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs font-medium text-destructive dark:text-destructive">
              ${t("profile.degWarning")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
