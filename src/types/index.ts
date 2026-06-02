export type UserRole = "admin" | "student";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  nim?: string;
}

export interface Student {
  id: string;
  nim: string;
  name: string;
  gender: "L" | "P";
  age: number;
  maritalStatus: "Single" | "Married";
  employmentStatus: "Employed" | "Unemployed";
  /** IPS per semester, index 0 = Semester 1 */
  ips: number[];
  ipk: number;
  riskScore: number; // 0–100
  riskLabel: "Low" | "Medium" | "High";
  graduationStatus: "On-Time" | "Late";
  /** True when IPS drop in Sem 7-8 exceeds the 0.5-point threshold */
  hasIPSDegradation: boolean;
  program: string;
  entryYear: number;
}

export interface KPISummary {
  totalStudents: number;
  predictedOnTime: number;
  predictedLate: number;
  highRiskCount: number;
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

export interface PredictionInput {
  age: number;
  maritalStatus: "Single" | "Married";
  employmentStatus: "Employed" | "Unemployed";
  ips: (number | "")[];
  currentSemester: number;
}

export interface PredictionResult {
  riskScore: number;
  riskLabel: "Low" | "Medium" | "High";
  prediction: "On-Time" | "Late";
  confidence: number;
  keyFactors: string[];
}
