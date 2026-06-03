export type UserRole = "admin" | "student";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  nim?: string;
}

// ── Student Profile (self-reported) ──────────────────────────────────────────

export interface StudentProfile {
  id: number;
  user_id: string;
  nim: string;
  name: string;
  gender: "L" | "P";
  age: number;
  maritalStatus: "Single" | "Married";
  employmentStatus: "Employed" | "Unemployed";
  program: string;
  entryYear: number;
  ips: number[];
  currentSemester: number;
  ipk: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfileInput {
  name: string;
  gender: "L" | "P";
  age: number;
  marital_status: "Single" | "Married";
  employment_status: "Employed" | "Unemployed";
  program: string;
  entry_year: number;
  ips: number[];
  current_semester: number;
}

export interface PublicPredictInput extends StudentProfileInput {
  nim: string;
}

// ── ML Model ─────────────────────────────────────────────────────────────────

export interface MLModel {
  id: number;
  name: string;
  originalFilename: string;
  algorithm: string;
  version: string;
  accuracy: number | null;
  description: string | null;
  featureNames: string[] | null;
  isActive: boolean;
  uploadedBy: string;
  uploadedAt: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface KPISummary {
  totalStudents: number;
  predictedOnTime: number;
  predictedLate: number;
  highRiskCount: number;
  todaySubmissions: number;
}

export interface IPSTrendPoint {
  semester: string;
  avgIPS: number;
}

export interface PopulationDataPoint {
  category: string;
  onTime: number;
  late: number;
}

// ── Prediction ────────────────────────────────────────────────────────────────

export interface PredictionInput {
  age: number;
  marital_status: "Single" | "Married";
  employment_status: "Employed" | "Unemployed";
  ips: number[];
  current_semester: number;
}

export interface PredictionResult {
  riskScore: number;
  riskLabel: "Low" | "Medium" | "High";
  prediction: "On-Time" | "Late";
  confidence: number;
  keyFactors: string[];
  recommendations: string[];
  modelUsed: string;
  ipsTrend: number[] | null;
  avgIPS: number | null;
  ipsDrop: number | null;
}

export interface PredictionLogEntry {
  id: number;
  createdAt: string;
  studentNim: string | null;
  studentName: string | null;
  riskScore: number;
  riskLabel: string;
  prediction: string;
  confidence: number;
  modelName: string | null;
}
