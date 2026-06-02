/**
 * GradTracker API Service Layer
 *
 * Saat ini menggunakan mock data dengan simulated delay.
 * Untuk koneksi ke FastAPI backend, set environment variable:
 * NEXT_PUBLIC_API_URL=http://localhost:8000
 * lalu hapus blok `if (USE_MOCK)` pada setiap fungsi.
 */

import type {
  Student,
  KPISummary,
  IPSTrendPoint,
  PopulationDataPoint,
  PredictionInput,
  PredictionResult,
} from "@/types";
import {
  mockStudents,
  kpiSummary,
  globalIPSTrend,
  ageDistribution,
  employmentDistribution,
} from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const USE_MOCK = !process.env.NEXT_PUBLIC_API_URL;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Dashboard ────────────────────────────────────────────────────────────────

export async function fetchKPI(): Promise<KPISummary> {
  if (USE_MOCK) {
    await delay(600);
    return kpiSummary;
  }
  const res = await fetch(`${API_BASE}/api/dashboard/kpi`);
  if (!res.ok) throw new Error("Failed to fetch KPI");
  return res.json();
}

export async function fetchIPSTrend(): Promise<IPSTrendPoint[]> {
  if (USE_MOCK) {
    await delay(500);
    return globalIPSTrend;
  }
  const res = await fetch(`${API_BASE}/api/dashboard/ips-trend`);
  if (!res.ok) throw new Error("Failed to fetch IPS trend");
  return res.json();
}

// ── Students ─────────────────────────────────────────────────────────────────

export async function fetchStudents(params?: {
  riskLabel?: Student["riskLabel"];
  program?: string;
}): Promise<Student[]> {
  if (USE_MOCK) {
    await delay(750);
    let result = mockStudents;
    if (params?.riskLabel)
      result = result.filter((s) => s.riskLabel === params.riskLabel);
    if (params?.program)
      result = result.filter((s) => s.program === params.program);
    return result;
  }
  const url = new URL(`${API_BASE}/api/students`);
  if (params?.riskLabel) url.searchParams.set("risk_label", params.riskLabel);
  if (params?.program) url.searchParams.set("program", params.program);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function fetchStudent(nim: string): Promise<Student | null> {
  if (USE_MOCK) {
    await delay(350);
    return mockStudents.find((s) => s.nim === nim) ?? null;
  }
  const res = await fetch(`${API_BASE}/api/students/${nim}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch student ${nim}`);
  return res.json();
}

// ── Analytics ────────────────────────────────────────────────────────────────

export async function fetchAgeDistribution(): Promise<PopulationDataPoint[]> {
  if (USE_MOCK) {
    await delay(400);
    return ageDistribution;
  }
  const res = await fetch(`${API_BASE}/api/analytics/age-distribution`);
  if (!res.ok) throw new Error("Failed to fetch age distribution");
  return res.json();
}

export async function fetchEmploymentDistribution(): Promise<
  PopulationDataPoint[]
> {
  if (USE_MOCK) {
    await delay(400);
    return employmentDistribution;
  }
  const res = await fetch(`${API_BASE}/api/analytics/employment-distribution`);
  if (!res.ok) throw new Error("Failed to fetch employment distribution");
  return res.json();
}

// ── ML Prediction ────────────────────────────────────────────────────────────

export async function predict(
  input: PredictionInput,
): Promise<PredictionResult> {
  if (!USE_MOCK) {
    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: input.age,
          marital_status: input.maritalStatus,
          employment_status: input.employmentStatus,
          ips: (input.ips as number[])
            .slice(0, input.currentSemester)
            .filter((v) => v > 0),
          current_semester: input.currentSemester,
        }),
      });
      if (res.ok) return res.json();
    } catch {
      // Fall through to mock predictor
    }
  }

  // Mock predictor — mirrors backend logic
  await delay(900);
  return mockPredict(input);
}

function mockPredict(input: PredictionInput): PredictionResult {
  const validIPS = (input.ips as number[])
    .slice(0, input.currentSemester)
    .filter((v) => v > 0);

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

  if (input.employmentStatus === "Employed") {
    score += 35;
    factors.push("Status bekerja meningkatkan risiko signifikan");
  }
  if (input.maritalStatus === "Married") {
    score += 15;
    factors.push("Status menikah berkorelasi dengan beban non-akademik");
  }
  if (input.age >= 25) {
    score += 20;
    factors.push("Usia di atas rata-rata angkatan");
  } else if (input.age >= 23) {
    score += 10;
  }

  if (validIPS.length >= 2) {
    const drop = validIPS[validIPS.length - 2] - validIPS[validIPS.length - 1];
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
  const confidence = parseFloat((0.62 + (score / 100) * 0.28).toFixed(3));

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
