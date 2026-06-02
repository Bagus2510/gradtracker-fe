"use client";

import { useAuth } from "@/context/auth-context";
import { DataUploadZone } from "@/components/simulation/data-upload-zone";
import { PredictionForm } from "@/components/simulation/prediction-form";
import { useI18n } from "@/context/i18n-context";

export default function SimulationPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Data Management & Simulation</h2>
        <p className="text-sm text-muted-foreground">
          {user?.role === "admin"
            ? "Import data mahasiswa dan jalankan simulasi prediksi risiko kelulusan."
            : "Simulasikan skenario akademik untuk melihat prediksi risiko kelulusan Anda."}
        </p>
      </div>

      {/* Data upload zone — Admin only */}
      {user?.role === "admin" && <DataUploadZone />}

      {/* Prediction simulator — Both roles */}
      <PredictionForm />
    </div>
  );
}
