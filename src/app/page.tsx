"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { predictPublicRisk } from "@/lib/api";
import type { PublicPredictInput, PredictionResult } from "@/types";
import { cn } from "@/lib/utils";
import {
  Cpu,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  Lightbulb,
  ChevronRight,
  BarChart2,
  BrainCircuit,
  RefreshCw,
  User,
  BookOpen,
  Briefcase,
  Heart,
  Calendar,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ── Shared Config ─────────────────────────────────────────────────────────────
const FACULTIES: Record<string, string[]> = {
  "Fakultas Teknik": ["Teknik Informatika", "Sistem Informasi", "Teknik Elektro", "Teknik Mesin", "Teknik Industri", "Teknik Sipil"],
  "Fakultas Ekonomi dan Bisnis": ["Manajemen", "Akuntansi", "Ilmu Ekonomi", "Bisnis Digital"],
  "Fakultas MIPA": ["Matematika", "Fisika", "Kimia", "Biologi", "Statistika"],
  "Fakultas Psikologi": ["Psikologi"],
  "Fakultas Ilmu Budaya": ["Sastra Inggris", "Sastra Indonesia", "Ilmu Sejarah"],
  "Fakultas Kedokteran": ["Pendidikan Dokter", "Ilmu Keperawatan", "Farmasi"],
  "Fakultas Hukum": ["Ilmu Hukum"],
  "Fakultas Ilmu Komputer": ["Ilmu Komputer", "Teknologi Informasi", "Rekayasa Perangkat Lunak"],
};

const RISK_CFG = {
  High: {
    bg: "bg-destructive/10 border-destructive/30",
    text: "text-destructive",
    badge: "bg-destructive text-white",
    icon: AlertTriangle,
  },
  Medium: {
    bg: "bg-accent/10 border-accent/30",
    text: "text-accent",
    badge: "bg-accent text-accent-foreground",
    icon: Clock,
  },
  Low: {
    bg: "bg-secondary/10 border-secondary/30",
    text: "text-secondary",
    badge: "bg-secondary text-secondary-foreground",
    icon: CheckCircle2,
  },
} as const;

// ── Result component ─────────────────────────────────────────────────────────
function PredictionResultCard({ result }: { result: PredictionResult }) {
  const cfg = RISK_CFG[result.riskLabel];
  const RiskIcon = cfg.icon;

  const trendData = result.ipsTrend?.map((v, i) => ({
    sem: `Sem ${i + 1}`,
    ips: v,
  }));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
      {/* Main result */}
      <div className={cn("rounded-2xl border-2 p-6", cfg.bg)}>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Risk score dial */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 shadow-lg",
                cfg.bg,
                result.riskLabel === "High"
                  ? "border-destructive"
                  : result.riskLabel === "Medium"
                    ? "border-accent"
                    : "border-secondary",
              )}
            >
              <span className={cn("text-3xl font-black tabular-nums", cfg.text)}>
                {result.riskScore}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">/ 100</span>
            </div>
            <span className={cn("rounded-full px-3 py-1 text-xs font-bold", cfg.badge)}>
              {result.riskLabel} Risk
            </span>
          </div>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div>
              <p className="text-sm text-muted-foreground">Prediksi Kelulusan</p>
              <p className={cn("text-2xl font-black", cfg.text)}>
                {result.prediction === "On-Time" ? "✅ Tepat Waktu" : "⚠️ Berisiko Terlambat"}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:justify-start">
              <div>
                <p className="text-xs text-muted-foreground">Kepercayaan Model</p>
                <p className="text-lg font-bold">
                  {(result.confidence * 100).toFixed(1)}%
                </p>
              </div>
              {result.avgIPS !== null && (
                <div>
                  <p className="text-xs text-muted-foreground">Rata-rata IPS</p>
                  <p className="text-lg font-bold">{result.avgIPS?.toFixed(2)}</p>
                </div>
              )}
              {result.ipsDrop !== null && result.ipsDrop !== undefined && (
                <div>
                  <p className="text-xs text-muted-foreground">Perubahan IPS</p>
                  <p
                    className={cn(
                      "flex items-center gap-1 text-lg font-bold",
                      result.ipsDrop > 0
                        ? "text-destructive"
                        : result.ipsDrop < 0
                          ? "text-secondary"
                          : "text-muted-foreground",
                    )}
                  >
                    {result.ipsDrop > 0 ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : result.ipsDrop < 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                    {Math.abs(result.ipsDrop).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground sm:justify-start">
              <BrainCircuit className="h-3 w-3" />
              Model: {result.modelUsed}
            </p>
          </div>
        </div>
      </div>

      {/* IPS Trend Chart */}
      {trendData && trendData.length > 1 && (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <BarChart2 className="h-4 w-4 text-primary" />
            Tren IPS Kamu
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="sem" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 4]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [typeof v === "number" ? v.toFixed(2) : v, "IPS"]}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="ips"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Key Factors & Recs */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <RiskIcon className={cn("h-4 w-4", cfg.text)} />
            Faktor Risiko
          </p>
          <ul className="space-y-2">
            {result.keyFactors.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <ChevronRight className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", cfg.text)} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4 text-secondary" />
            Rekomendasi
          </p>
          <ul className="space-y-2">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Boot Sequence (Loading Screen + Guide) ──────────────────────────────────
function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = [
    { text: "Memuat Modul Prediksi AI...", icon: Cpu },
    { text: "Panduan 1: Lengkapi Data Diri & Fakultas", icon: User },
    { text: "Panduan 2: Masukkan Riwayat Nilai IPS (0.00-4.00)", icon: BookOpen },
    { text: "Panduan 3: Sistem Akan Memprediksi Peluang Kelulusan", icon: BrainCircuit },
  ];

  useEffect(() => {
    let current = 0;
    const duration = 4000; // 4 seconds loading time
    const intervalTime = 30;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      current += increment;
      if (current >= 100) {
        setProgress(100);
        clearInterval(timer);
        setTimeout(onComplete, 600); // Pause briefly at 100%
      } else {
        setProgress(current);
        if (current < 25) setStep(0);
        else if (current < 50) setStep(1);
        else if (current < 75) setStep(2);
        else setStep(3);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  const CurrentIcon = steps[step].icon;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
      
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-card shadow-2xl border border-primary/20 animate-pulse">
          <CurrentIcon className="h-10 w-10 text-primary" />
        </div>
        
        <h2 className="mb-2 text-2xl font-black tracking-tight text-foreground">
          GradTracker AI
        </h2>
        
        <div className="mb-10 h-10 flex items-center justify-center text-center">
          <p className="text-sm font-medium text-muted-foreground animate-in slide-in-from-bottom-2 fade-in duration-300" key={step}>
            {steps[step].text}
          </p>
        </div>

        <div className="w-full space-y-3">
          <div className="flex justify-between text-xs font-bold font-mono text-primary">
            <span>MEMUAT SISTEM</span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
            <div 
              className="h-full bg-primary transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root Page ─────────────────────────────────────────────────────────────────
export default function PublicPredictionPage() {
  const router = useRouter();
  const { isDark, mounted, toggle: toggleTheme } = useTheme();
  const [booting, setBooting] = useState(true);
  const [faculty, setFaculty] = useState<string>("");
  const [form, setForm] = useState<PublicPredictInput>({
    nim: "",
    name: "",
    gender: "L",
    age: 20,
    marital_status: "Single",
    employment_status: "Unemployed",
    program: "",
    entry_year: new Date().getFullYear() - 2,
    ips: [0, 0, 0, 0, 0, 0, 0, 0],
    current_semester: 1,
  });

  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIPSChange = (idx: number, val: string) => {
    const parsed = parseFloat(val);
    const newIps = [...form.ips];
    newIps[idx] = isNaN(parsed) ? 0 : Math.min(4.0, Math.max(0, parsed));
    setForm((f) => ({ ...f, ips: newIps }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredicting(true);
    setError(null);
    try {
      const res = await predictPublicRisk(form);
      setResult(res);
      // Scroll to result slightly delay
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses prediksi.");
    } finally {
      setPredicting(false);
    }
  };

  const ipk =
    form.ips.filter((v) => v > 0).length > 0
      ? (
          form.ips.filter((v) => v > 0).reduce((a, b) => a + b, 0) /
          form.ips.filter((v) => v > 0).length
        ).toFixed(2)
      : "—";

  if (booting) {
    return <BootSequence onComplete={() => setBooting(false)} />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20 overflow-hidden animate-in fade-in duration-1000">
      {/* Decorative Blobs */}
      <div className="absolute top-0 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 -right-40 h-[30rem] w-[30rem] rounded-full bg-secondary/5 blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/60 px-4 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-2 text-primary font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Cpu className="h-5 w-5" />
          </div>
          <span className="text-lg tracking-tight">GradTracker</span>
        </div>
        
        {mounted && (
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground shadow-sm"
            title="Toggle Theme"
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        )}
      </header>

      <main className="relative mx-auto max-w-3xl px-4 py-8 sm:py-16 sm:px-6">
        <div className="mb-10 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
            Prediksi Berbasis Machine Learning
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl text-foreground">
            Cek Risiko Kelulusanmu
          </h1>
          <p className="mx-auto max-w-xl text-muted-foreground sm:text-lg">
            Sistem cerdas GradTracker membantu mendeteksi potensi keterlambatan lulus sejak dini. Masukkan datamu dan dapatkan hasilnya seketika.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Identity */}
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
              <User className="h-4 w-4 text-primary" /> Data Diri
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">NIM Lengkap</span>
                <input
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={form.nim}
                  placeholder="Contoh: 10119001"
                  onChange={(e) => setForm((f) => ({ ...f, nim: e.target.value }))}
                  required
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Nama Lengkap</span>
                <input
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={form.name}
                  placeholder="Contoh: Budi Santoso"
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Jenis Kelamin</span>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as "L" | "P" }))}
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Usia</span>
                <input
                  type="number"
                  min={17}
                  max={60}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: parseInt(e.target.value) || 20 }))}
                />
              </label>
              <label className="space-y-1.5">
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Heart className="h-3 w-3" /> Status Pernikahan
                </span>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={form.marital_status}
                  onChange={(e) => setForm((f) => ({ ...f, marital_status: e.target.value as "Single" | "Married" }))}
                >
                  <option value="Single">Belum Menikah</option>
                  <option value="Married">Menikah</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Briefcase className="h-3 w-3" /> Status Pekerjaan
                </span>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={form.employment_status}
                  onChange={(e) => setForm((f) => ({ ...f, employment_status: e.target.value as "Employed" | "Unemployed" }))}
                >
                  <option value="Unemployed">Tidak Bekerja</option>
                  <option value="Employed">Bekerja</option>
                </select>
              </label>
            </div>
          </div>

          {/* Academic */}
          <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            <h3 className="flex items-center justify-between gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
              <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Data Akademik</span>
              <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-secondary lowercase tracking-normal">
                ipk {ipk}
              </span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Fakultas</span>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={faculty}
                  onChange={(e) => {
                    setFaculty(e.target.value);
                    setForm((f) => ({ ...f, program: "" }));
                  }}
                  required
                >
                  <option value="" disabled>Pilih Fakultas</option>
                  {Object.keys(FACULTIES).map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Program Studi</span>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
                  value={form.program}
                  onChange={(e) => setForm((f) => ({ ...f, program: e.target.value }))}
                  disabled={!faculty}
                  required
                >
                  <option value="" disabled>Pilih Program Studi</option>
                  {faculty && FACULTIES[faculty].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Tahun Masuk
                </span>
                <input
                  type="number"
                  min={2000}
                  max={2100}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={form.entry_year}
                  onChange={(e) => setForm((f) => ({ ...f, entry_year: parseInt(e.target.value) }))}
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Semester Sekarang</span>
                <select
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={form.current_semester}
                  onChange={(e) => setForm((f) => ({ ...f, current_semester: parseInt(e.target.value) }))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t">
              <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-3 w-3" /> IPS per Semester (0.00 – 4.00)
              </p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {form.ips.map((val, idx) => (
                  <label key={idx} className="space-y-1">
                    <span className="block text-center text-[10px] text-muted-foreground">
                      Sem {idx + 1}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.00"
                      className={cn(
                        "w-full rounded-lg border px-1 py-1.5 text-center text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40",
                        idx >= form.current_semester
                          ? "bg-muted text-muted-foreground opacity-40"
                          : "bg-background",
                      )}
                      value={val === 0 ? "" : val}
                      disabled={idx >= form.current_semester}
                      placeholder="0.00"
                      onChange={(e) => handleIPSChange(idx, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={predicting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both"
          >
            {predicting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Menganalisis Data...
              </>
            ) : result ? (
              <>
                <RefreshCw className="h-5 w-5" />
                Prediksi Ulang
              </>
            ) : (
              <>
                <Cpu className="h-5 w-5" />
                Prediksi Sekarang
              </>
            )}
          </button>
        </form>

        {result && <PredictionResultCard result={result} />}
      </main>
    </div>
  );
}
