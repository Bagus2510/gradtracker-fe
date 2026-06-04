"use client";

import { useState, useEffect } from "react";
import { fetchAllStudents } from "@/lib/api";
import { useI18n } from "@/context/i18n-context";
import type { StudentProfile } from "@/types";
import {
  Users,
  Search,
  ArrowLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function AdminStudentsPage() {
  const { t } = useI18n();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<StudentProfile | null>(null);

  useEffect(() => {
    fetchAllStudents()
      .then(setStudents)
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) => {
    const q = query.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q);
  });

  if (selected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> {t("studentsPage.back")}
          </button>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm font-semibold">{selected.name}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: t("studentsPage.detailNim"), value: selected.nim },
            { label: t("studentsPage.detailProgram"), value: selected.program },
            { label: t("studentsPage.detailAge"), value: `${selected.age} ${t("studentsPage.detailAgeUnit")}` },
            { label: t("studentsPage.detailGender"), value: selected.gender === "L" ? t("studentsPage.detailGenderM") : t("studentsPage.detailGenderF") },
            { label: t("studentsPage.detailMarital"), value: selected.maritalStatus },
            { label: t("studentsPage.detailEmployment"), value: selected.employmentStatus },
            { label: t("studentsPage.detailYear"), value: selected.entryYear },
            { label: t("studentsPage.detailSemester"), value: `${t("studentsPage.detailSemesterUnit")} ${selected.currentSemester}` },
            { label: t("studentsPage.detailIpk"), value: selected.ipk.toFixed(2) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-4">
          <p className="mb-3 text-xs font-semibold text-muted-foreground uppercase">{t("studentsPage.detailIpsSem")}</p>
          <div className="flex flex-wrap gap-2">
            {selected.ips.map((v, i) => (
              <div key={i} className="rounded-lg border bg-background px-3 py-2 text-center">
                <p className="text-[10px] text-muted-foreground">{t("studentsPage.detailSem")} {i + 1}</p>
                <p className="font-mono text-sm font-bold">{v.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{t("studentsPage.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {students.length} {t("studentsPage.desc")}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          placeholder={t("studentsPage.searchPh")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center text-muted-foreground">
          <Users className="h-8 w-8 opacity-30" />
          <p className="text-sm">
            {students.length === 0
              ? t("studentsPage.empty")
              : t("studentsPage.notFound")}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="group w-full rounded-xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{s.nim}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {t("studentsPage.detailIpk")} {s.ipk.toFixed(2)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <p className="text-xs text-muted-foreground">{s.program}</p>
                <p className="text-xs text-muted-foreground">{t("studentsPage.detailSem")} {s.currentSemester}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
