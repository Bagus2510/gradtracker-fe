/**
 * GradTracker API v2 Service Layer
 * All endpoints are authenticated via Bearer JWT token.
 * Token is stored in localStorage under "gradtracker_token".
 * When NEXT_PUBLIC_API_URL is not set, falls back to mock data.
 */

import type {
  KPISummary,
  IPSTrendPoint,
  PopulationDataPoint,
  PredictionInput,
  PredictionResult,
  StudentProfile,
  StudentProfileInput,
  PublicPredictInput,
  MLModel,
  PredictionLogEntry,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const TOKEN_KEY = "gradtracker_token";

// ── Auth helpers ──────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) throw new Error("API_BASE not configured");
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}



export async function predictPublicRisk(
  input: PublicPredictInput,
): Promise<PredictionResult> {
  return apiFetch<PredictionResult>("/api/public/predict", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ── Dashboard (Admin) ─────────────────────────────────────────────────────────

export async function fetchKPI(): Promise<KPISummary> {
  if (!API_BASE) {
    return {
      totalStudents: 0,
      predictedOnTime: 0,
      predictedLate: 0,
      highRiskCount: 0,
      todaySubmissions: 0,
    };
  }
  return apiFetch<KPISummary>("/api/dashboard/kpi");
}

export async function fetchIPSTrend(): Promise<IPSTrendPoint[]> {
  if (!API_BASE) return [];
  return apiFetch<IPSTrendPoint[]>("/api/dashboard/ips-trend");
}

// ── Analytics (Admin) ─────────────────────────────────────────────────────────

export async function fetchAgeDistribution(): Promise<PopulationDataPoint[]> {
  if (!API_BASE) return [];
  return apiFetch<PopulationDataPoint[]>("/api/analytics/age-distribution");
}

export async function fetchEmploymentDistribution(): Promise<
  PopulationDataPoint[]
> {
  if (!API_BASE) return [];
  return apiFetch<PopulationDataPoint[]>(
    "/api/analytics/employment-distribution",
  );
}

// ── Admin Students ────────────────────────────────────────────────────────────

export async function fetchAllStudents(params?: {
  program?: string;
}): Promise<StudentProfile[]> {
  if (!API_BASE) return [];
  const url = new URL(`${API_BASE}/api/admin/students`);
  if (params?.program) url.searchParams.set("program", params.program);
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function fetchStudentByNim(
  nim: string,
): Promise<StudentProfile | null> {
  if (!API_BASE) return null;
  try {
    return await apiFetch<StudentProfile>(`/api/admin/students/${nim}`);
  } catch {
    return null;
  }
}

export async function fetchAllPredictions(
  limit = 50,
): Promise<PredictionLogEntry[]> {
  if (!API_BASE) return [];
  return apiFetch<PredictionLogEntry[]>(
    `/api/admin/predictions?limit=${limit}`,
  );
}

// ── Admin ML Models ────────────────────────────────────────────────────────────

export async function fetchMLModels(): Promise<MLModel[]> {
  if (!API_BASE) return [];
  return apiFetch<MLModel[]>("/api/admin/models");
}

export async function uploadMLModel(
  formData: FormData,
): Promise<MLModel> {
  if (!API_BASE) throw new Error("API not configured");
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/admin/models`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData, // multipart/form-data — don't set Content-Type manually
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `Upload failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function activateMLModel(id: number): Promise<MLModel> {
  return apiFetch<MLModel>(`/api/admin/models/${id}/activate`, {
    method: "PUT",
  });
}

export async function deleteMLModel(id: number): Promise<void> {
  await apiFetch<{ message: string }>(`/api/admin/models/${id}`, {
    method: "DELETE",
  });
}
