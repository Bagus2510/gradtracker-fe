import type { PredictionResult } from "@/types";

export const MAX_SEMESTER = 12;

export function getMaxNormalSemesters(programLevel: string): number {
  return programLevel === "D3" ? 6 : 8;
}

export function createEmptyIps(length = MAX_SEMESTER): number[] {
  return Array(length).fill(0);
}

/** IPS values for semesters 1..currentSemester (inclusive). */
export function getActiveIps(ips: number[], currentSemester: number): number[] {
  return ips.slice(0, currentSemester);
}

export interface IpsMetrics {
  activeIps: number[];
  avgIps: number;
  ipsDrop: number | null;
  maxNormalSemesters: number;
}

export function computeIpsMetrics(
  ips: number[],
  currentSemester: number,
  programLevel = "S1/D4",
): IpsMetrics {
  const activeIps = getActiveIps(ips, currentSemester);
  const maxNormalSemesters = getMaxNormalSemesters(programLevel);

  if (activeIps.length === 0) {
    return { activeIps, avgIps: 0, ipsDrop: null, maxNormalSemesters };
  }

  const avgIps =
    Math.round((activeIps.reduce((a, b) => a + b, 0) / activeIps.length) * 1000) /
    1000;

  let ipsDrop: number | null = null;
  if (activeIps.length >= 2) {
    const prevAvg =
      activeIps.slice(0, -1).reduce((a, b) => a + b, 0) / (activeIps.length - 1);
    ipsDrop = Math.round((prevAvg - activeIps[activeIps.length - 1]) * 1000) / 1000;
  }

  return { activeIps, avgIps, ipsDrop, maxNormalSemesters };
}

export function computeIpk(ips: number[], currentSemester: number): string {
  const { activeIps, avgIps } = computeIpsMetrics(ips, currentSemester);
  if (activeIps.length === 0 || activeIps.some((v) => v <= 0)) return "—";
  return avgIps.toFixed(2);
}

export function validateActiveIps(ips: number[], currentSemester: number): boolean {
  const active = getActiveIps(ips, currentSemester);
  return active.length === currentSemester && active.every((v) => v > 0 && v <= 4);
}

export function parseIpsInput(val: string): number {
  const parsed = parseFloat(val);
  if (isNaN(parsed)) return 0;
  return Math.min(4, Math.max(0, Math.round(parsed * 100) / 100));
}

function isAcademicallyOnTrack(metrics: IpsMetrics): boolean {
  const { activeIps, avgIps, ipsDrop, maxNormalSemesters } = metrics;
  if (activeIps.length === 0) return false;
  if (activeIps.some((v) => v < 2.75)) return false;
  if (avgIps < 3.0) return false;
  if (ipsDrop !== null && ipsDrop > 0.3) return false;
  return activeIps.length <= maxNormalSemesters;
}

function isAcademicallyExcellent(metrics: IpsMetrics): boolean {
  const { activeIps, avgIps, ipsDrop, maxNormalSemesters } = metrics;
  if (activeIps.length === 0) return false;
  if (activeIps.some((v) => v < 3.0)) return false;
  if (avgIps < 3.5) return false;
  if (ipsDrop !== null && ipsDrop > 0.1) return false;
  return activeIps.length <= maxNormalSemesters;
}

/**
 * Align prediction output with the IPS/IPK data the user actually entered.
 * Prevents contradictory results (e.g. IPK 4.00 but flagged late purely from non-academic heuristics).
 */
export function refinePredictionResult(
  result: PredictionResult,
  ips: number[],
  currentSemester: number,
  programLevel = "S1/D4",
): PredictionResult {
  const metrics = computeIpsMetrics(ips, currentSemester, programLevel);
  const { activeIps, avgIps, ipsDrop } = metrics;

  const synced: PredictionResult = {
    ...result,
    avgIPS: avgIps,
    ipsDrop,
    ipsTrend: activeIps,
  };

  if (isAcademicallyExcellent(metrics) && synced.prediction === "TERLAMBAT") {
    return {
      ...synced,
      prediction: "TEPAT",
      riskScore: Math.min(synced.riskScore, 35),
      riskLabel: "Low",
      confidence: Math.max(synced.confidence, 0.78),
      keyFactors: [
        `Performa akademik sangat baik (IPK ${avgIps.toFixed(2)})`,
        ...synced.keyFactors.filter(
          (f) =>
            !f.toLowerCase().includes("ips kritis") &&
            !f.toLowerCase().includes("penurunan") &&
            !f.toLowerCase().includes("di bawah standar"),
        ),
      ],
      recommendations: [
        "Pertahankan performa akademik saat ini",
        "Rencanakan jadwal pengerjaan skripsi/tugas akhir lebih awal",
        ...synced.recommendations.filter(
          (r) =>
            !r.toLowerCase().includes("konsultasi") &&
            !r.toLowerCase().includes("bimbingan belajar"),
        ),
      ].slice(0, 4),
    };
  }

  if (isAcademicallyOnTrack(metrics) && synced.prediction === "TERLAMBAT") {
    const onlyNonAcademicFactors = synced.keyFactors.every(
      (f) =>
        f.toLowerCase().includes("bekerja") ||
        f.toLowerCase().includes("menikah") ||
        f.toLowerCase().includes("usia") ||
        f.toLowerCase().includes("batas") ||
        f.toLowerCase().includes("melewati"),
    );

    if (onlyNonAcademicFactors && currentSemester <= metrics.maxNormalSemesters) {
      return {
        ...synced,
        prediction: "TEPAT",
        riskScore: Math.min(synced.riskScore, 45),
        riskLabel: "Low",
        confidence: Math.max(synced.confidence, 0.72),
        keyFactors: [
          `Performa akademik stabil (IPK ${avgIps.toFixed(2)})`,
          ...synced.keyFactors,
        ],
      };
    }
  }

  return synced;
}
