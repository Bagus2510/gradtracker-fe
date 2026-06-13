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
  return apiFetch<KPISummary>("/api/dashboard/kpi");
}

export async function fetchIPSTrend(): Promise<IPSTrendPoint[]> {
  return apiFetch<IPSTrendPoint[]>("/api/dashboard/ips-trend");
}

// ── Analytics (Admin) ─────────────────────────────────────────────────────────

export async function fetchAgeDistribution(): Promise<PopulationDataPoint[]> {
  return apiFetch<PopulationDataPoint[]>("/api/analytics/age-distribution");
}

export async function fetchEmploymentDistribution(): Promise<
  PopulationDataPoint[]
> {
  return apiFetch<PopulationDataPoint[]>(
    "/api/analytics/employment-distribution",
  );
}

// ── Admin Students ────────────────────────────────────────────────────────────

export async function fetchAllStudents(params?: {
  program?: string;
}): Promise<StudentProfile[]> {
  let path = `${API_BASE}/api/admin/students`;
  if (params?.program) path += `?program=${encodeURIComponent(params.program)}`;
  const res = await fetch(path, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function fetchStudentByNim(
  nim: string,
): Promise<StudentProfile | null> {
  try {
    return await apiFetch<StudentProfile>(`/api/admin/students/${nim}`);
  } catch {
    return null;
  }
}

export async function fetchAllPredictions(
  limit = 50,
): Promise<PredictionLogEntry[]> {
  return apiFetch<PredictionLogEntry[]>(
    `/api/admin/predictions?limit=${limit}`,
  );
}

// ── Admin ML Models ────────────────────────────────────────────────────────────

export async function fetchMLModels(): Promise<MLModel[]> {
  return apiFetch<MLModel[]>("/api/admin/models");
}

export async function uploadMLModel(
  formData: FormData,
): Promise<MLModel> {
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

// ── Admin Users ──────────────────────────────────────────────────────────────

export async function fetchUsers(): Promise<any[]> {
  return apiFetch<any[]>("/api/admin/users");
}

export async function createUser(data: any): Promise<any> {
  return apiFetch<any>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch<{ message: string }>(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
}
