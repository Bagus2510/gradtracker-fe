"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  TrendingDown,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { mockStudents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { StudentMetadataCard } from "@/components/profile/student-metadata-card";
import { RiskGauge } from "@/components/profile/risk-gauge";
import { IPSComparisonChart } from "@/components/profile/ips-comparison-chart";
import type { Student } from "@/types";
import { useI18n } from "@/context/i18n-context";

// ── Risk style config ─────────────────────────────────────────────────────────
const riskCfg = {
  High: {
    border: "border-l-destructive",
    avatar:
      "bg-destructive/20 text-destructive dark:bg-destructive/20 dark:text-destructive",
    badge:
      "bg-destructive/20 text-destructive border-destructive dark:bg-destructive/20 dark:text-destructive dark:border-destructive",
  },
  Medium: {
    border: "border-l-accent",
    avatar: "bg-accent/20 text-amber-700 dark:bg-accent/20 dark:text-accent",
    badge:
      "bg-accent/20 text-amber-700 border-amber-500 dark:bg-accent/20 dark:text-accent dark:border-accent",
  },
  Low: {
    border: "border-l-secondary",
    avatar:
      "bg-secondary/20 text-yellow-700 dark:bg-secondary/20 dark:text-secondary",
    badge:
      "bg-secondary/20 text-yellow-700 border-yellow-500 dark:bg-secondary/20 dark:text-secondary dark:border-secondary",
  },
} as const;

// ── Student card ──────────────────────────────────────────────────────────────
function StudentCard({
  student,
  onClick,
}: {
  student: Student;
  onClick: () => void;
}) {
  const cfg = riskCfg[student.riskLabel];
  const initials = student.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full text-left rounded-xl border bg-card p-4",
        "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={cn(
            "h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold",
            cfg.avatar,
          )}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold">{student.name}</p>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                cfg.badge,
              )}
            >
              {student.riskLabel}
            </span>
          </div>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {student.nim}
          </p>
          <div className="mt-2 flex items-end justify-between">
            <p className="truncate text-xs text-muted-foreground">
              {student.program}
            </p>
            <div className="ml-2 shrink-0 text-right">
              <p className="text-[10px] text-muted-foreground">IPK</p>
              <p className="text-sm font-bold">{student.ipk.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-3">
          {student.hasIPSDegradation && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-destructive">
              <TrendingDown className="h-3 w-3" />
              IPS Degradasi
            </span>
          )}
          <span
            className={cn(
              "text-[10px] font-medium",
              student.graduationStatus === "On-Time"
                ? "text-secondary"
                : "text-destructive",
            )}
          >
            {student.graduationStatus === "On-Time"
              ? "✓ Tepat Waktu"
              : "⚠ Berisiko Terlambat"}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground transition-colors group-hover:text-primary">
          Lihat profil →
        </span>
      </div>
    </button>
  );
}

// ── Filter types ──────────────────────────────────────────────────────────────
type RiskFilter = "All" | Student["riskLabel"];

const filterOptions: RiskFilter[] = ["All", "High", "Medium", "Low"];

const filterActiveStyle: Record<RiskFilter, string> = {
  All: "bg-primary text-primary-foreground border-primary",
  High: "bg-destructive text-white border-destructive",
  Medium: "bg-accent text-accent-foreground border-accent",
  Low: "bg-secondary text-secondary-foreground border-secondary",
};

// ── Student Roster (admin only) ───────────────────────────────────────────────
function StudentRoster({ onSelect }: { onSelect: (s: Student) => void }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("All");

  const counts: Record<RiskFilter, number> = {
    All: mockStudents.length,
    High: mockStudents.filter((s) => s.riskLabel === "High").length,
    Medium: mockStudents.filter((s) => s.riskLabel === "Medium").length,
    Low: mockStudents.filter((s) => s.riskLabel === "Low").length,
  };

  const filtered = mockStudents.filter((s) => {
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.nim.toLowerCase().includes(q) ||
      s.program.toLowerCase().includes(q);
    const matchRisk = riskFilter === "All" || s.riskLabel === riskFilter;
    return matchQuery && matchRisk;
  });

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            {
              label: t("profile.totalTitle"),
              value: counts.All,
              cls: "text-primary",
            },
            {
              label: t("profile.riskHigh"),
              value: counts.High,
              cls: "text-destructive",
            },
            {
              label: t("profile.riskMedium"),
              value: counts.Medium,
              cls: "text-accent",
            },
            {
              label: t("profile.riskLow"),
              value: counts.Low,
              cls: "text-secondary",
            },
          ] as const
        ).map(({ label, value, cls }) => (
          <div
            key={label}
            className="rounded-xl border bg-card p-4 text-center shadow-sm"
          >
            <p className={cn("text-2xl font-bold tabular-nums", cls)}>
              {value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("profile.search")}
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filterOptions.map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                riskFilter === r
                  ? filterActiveStyle[r]
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {r === "All" ? t("profile.filterAll") : r} ({counts[r]})
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center text-muted-foreground">
          <Users className="h-8 w-8 opacity-30" />
          <p className="text-sm">{t("profile.empty")}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <StudentCard key={s.id} student={s} onClick={() => onSelect(s)} />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {t("profile.showing")}{" "}
        <span className="font-medium text-foreground">{filtered.length}</span>{" "}
        {t("profile.from")} {mockStudents.length}
      </p>
    </div>
  );
}

// ── Profile detail ────────────────────────────────────────────────────────────
function ProfileDetail({ student }: { student: Student }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudentMetadataCard student={student} />
        </div>
        <RiskGauge student={student} />
      </div>
      <IPSComparisonChart student={student} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(() => {
    if (user?.role === "student") {
      return mockStudents.find((s) => s.nim === user.nim) ?? null;
    }
    return null; // Admin starts at roster
  });

  // ── Student role: always show own profile ──
  if (user?.role === "student") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold">{t("profile.myTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("profile.myDesc")}
          </p>
        </div>
        {selectedStudent ? (
          <ProfileDetail student={selectedStudent} />
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed py-20 text-muted-foreground">
            <p>{t("profile.notFound")}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Admin role ──
  return (
    <div className="space-y-6">
      {selectedStudent ? (
        <>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedStudent(null)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("profile.back")}</span>
            </button>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm font-semibold">
              {selectedStudent.name}
            </span>
          </div>

          <ProfileDetail student={selectedStudent} />
        </>
      ) : (
        <>
          <div>
            <h2 className="text-xl font-bold">{t("profile.title")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("profile.desc")}
              
            </p>
          </div>
          <StudentRoster onSelect={setSelectedStudent} />
        </>
      )}
    </div>
  );
}
