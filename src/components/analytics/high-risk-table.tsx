"use client";

import { useState } from "react";
import {
  Search,
  TrendingDown,
  ChevronUp,
  ChevronDown,
  Download,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockStudents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Student } from "@/types";
import { useI18n } from "@/context/i18n-context";

const riskBadge: Record<Student["riskLabel"], string> = {
  Low: "bg-secondary/20 text-secondary border-secondary dark:bg-secondary/20 dark:text-secondary dark:border-secondary",
  Medium:
    "bg-accent/20 text-accent border-accent dark:bg-accent/20 dark:text-accent dark:border-accent",
  High: "bg-destructive/20 text-destructive border-destructive dark:bg-destructive/20 dark:text-destructive dark:border-destructive",
};

const highRiskStudents = mockStudents
  .filter((s) => s.riskLabel === "High")
  .sort((a, b) => b.riskScore - a.riskScore);

// Unique programs from high-risk roster
const PROGRAMS = [
  "Semua Program",
  ...Array.from(new Set(highRiskStudents.map((s) => s.program))).sort(),
];

function ipsDelta(student: Student): string | null {
  if (student.ips.length < 7) return null;
  return (student.ips[6] - student.ips[5]).toFixed(2);
}

function RiskScoreBar({ score }: { score: number }) {
  const color =
    score >= 65 ? "bg-destructive" : score >= 40 ? "bg-accent" : "bg-secondary";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="tabular-nums text-sm font-bold">{score}</span>
    </div>
  );
}

// ── CSV Export ────────────────────────────────────────────────────────────────
function exportCSV(students: Student[]) {
  const headers = [
    "NIM",
    "Nama",
    "Program Studi",
    "IPK",
    "Risk Score",
    "IPS Degradasi",
    "Status Risiko",
    "Prediksi Kelulusan",
    "Usia",
    "Status Pernikahan",
    "Status Pekerjaan",
  ];
  const rows = students.map((s) => [
    s.nim,
    s.name,
    s.program,
    s.ipk.toFixed(2),
    s.riskScore,
    s.hasIPSDegradation ? "Ya" : "Tidak",
    s.riskLabel,
    s.graduationStatus === "On-Time" ? "Tepat Waktu" : "Terlambat",
    s.age,
    s.maritalStatus === "Single" ? "Belum Menikah" : "Sudah Menikah",
    s.employmentStatus === "Employed" ? "Bekerja" : "Tidak Bekerja",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `high-risk-students-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function HighRiskTable() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [programFilter, setProgramFilter] = useState("Semua Program");

  const filtered = highRiskStudents
    .filter((s) => {
      const matchQuery =
        !query ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.nim.toLowerCase().includes(query.toLowerCase()) ||
        s.program.toLowerCase().includes(query.toLowerCase());
      const matchProgram =
        programFilter === "Semua Program" || s.program === programFilter;
      return matchQuery && matchProgram;
    })
    .sort((a, b) =>
      sortDir === "desc"
        ? b.riskScore - a.riskScore
        : a.riskScore - b.riskScore,
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>High-Risk Student Roster</CardTitle>
            <CardDescription>
              Daftar mahasiswa dengan prediksi risiko keterlambatan kelulusan
              tertinggi
            </CardDescription>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Program filter */}
            <Select
              value={programFilter}
              onValueChange={(v) => v && setProgramFilter(v)}
            >
              <SelectTrigger className="h-9 w-52 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROGRAMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative w-52">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari NIM / nama..."
                className="h-9 pl-9 text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Export */}
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-1.5"
              onClick={() => exportCSV(filtered)}
              disabled={filtered.length === 0}
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Active filter chip */}
        {(query || programFilter !== "Semua Program") && (
          <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
            <span>Menampilkan {filtered.length} hasil</span>
            {programFilter !== "Semua Program" && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 font-medium text-primary dark:bg-primary/20 dark:text-primary">
                {programFilter}
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">NIM</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="hidden md:table-cell">Program</TableHead>
              <TableHead className="hidden sm:table-cell">IPK</TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 font-semibold transition-colors hover:text-foreground"
                  onClick={() =>
                    setSortDir((d) => (d === "desc" ? "asc" : "desc"))
                  }
                >
                  Risk Score
                  {sortDir === "desc" ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5" />
                  )}
                </button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                Degradasi IPS
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  Tidak ada mahasiswa ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((student) => {
                const delta = ipsDelta(student);
                return (
                  <TableRow
                    key={student.id}
                    className="group transition-colors hover:bg-muted/40"
                  >
                    <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                      {student.nim}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {student.name}
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                      {student.program}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {student.ipk.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <RiskScoreBar score={student.riskScore} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {student.hasIPSDegradation && delta ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-destructive bg-destructive/10 text-destructive dark:border-destructive dark:bg-destructive/20 dark:text-destructive"
                        >
                          <TrendingDown className="h-3 w-3" />
                          {delta} di Sem 7
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={riskBadge[student.riskLabel]}
                      >
                        {student.riskLabel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
