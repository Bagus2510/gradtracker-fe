"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { fetchMLModels, uploadMLModel, activateMLModel, deleteMLModel } from "@/lib/api";
import type { MLModel } from "@/types";
import { cn } from "@/lib/utils";
import {
  BrainCircuit,
  Upload,
  Loader2,
  CheckCircle2,
  Trash2,
  Zap,
  ZapOff,
  AlertCircle,
  FileBox,
  Info,
  MoreVertical,
} from "lucide-react";

// ── Upload form ────────────────────────────────────────────────────────────────

function UploadModelCard({ onUploaded }: { onUploaded: (m: MLModel) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    algorithm: "Random Forest",
    version: "1.0.0",
    accuracy: "",
    description: "",
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const algorithms = [
    "Random Forest",
    "XGBoost",
    "Logistic Regression",
    "SVM",
    "Gradient Boosting",
    "Decision Tree",
    "Neural Network",
  ];

  const handleFile = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "pkl" && ext !== "joblib") {
      setError("Hanya file .pkl atau .joblib yang diizinkan.");
      return;
    }
    setFile(f);
    setError(null);
    if (!form.name) setForm((p) => ({ ...p, name: f.name.replace(/\.[^/.]+$/, "") }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", form.name);
      fd.append("algorithm", form.algorithm);
      fd.append("version", form.version);
      if (form.accuracy) fd.append("accuracy", form.accuracy);
      if (form.description) fd.append("description", form.description);
      const model = await uploadMLModel(fd);
      onUploaded(model);
      setFile(null);
      setForm({ name: "", algorithm: "Random Forest", version: "1.0.0", accuracy: "", description: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Upload className="h-4 w-4 text-primary" /> Upload Model Baru
      </h3>

      {/* Drop zone */}
      <div
        className={cn(
          "rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          file ? "border-secondary/60 bg-secondary/5" : "",
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pkl,.joblib"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileBox className="h-8 w-8 text-secondary" />
            <p className="font-semibold text-secondary">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <BrainCircuit className="h-8 w-8 opacity-40" />
            <p className="text-sm font-medium">Drag & drop file model di sini</p>
            <p className="text-xs">atau klik untuk pilih file (.pkl / .joblib)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Nama Model *</span>
          <input
            required
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="e.g. GradTracker RF v1"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Algoritma *</span>
          <select
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={form.algorithm}
            onChange={(e) => setForm((p) => ({ ...p, algorithm: e.target.value }))}
          >
            {algorithms.map((a) => <option key={a}>{a}</option>)}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Versi</span>
          <input
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="1.0.0"
            value={form.version}
            onChange={(e) => setForm((p) => ({ ...p, version: e.target.value }))}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Akurasi (%)</span>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="e.g. 85.5"
            value={form.accuracy}
            onChange={(e) => setForm((p) => ({ ...p, accuracy: e.target.value }))}
          />
        </label>
        <label className="space-y-1.5 sm:col-span-2">
          <span className="text-xs font-medium text-muted-foreground">Deskripsi</span>
          <textarea
            rows={2}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            placeholder="Trained on Kaggle dataset, features: age, IPS, employment..."
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={!file || uploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
      >
        {uploading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Mengupload...</>
        ) : (
          <><Upload className="h-4 w-4" /> Upload Model</>
        )}
      </button>
    </form>
  );
}

// ── Model card ─────────────────────────────────────────────────────────────────

function ModelCard({
  model,
  onActivate,
  onDelete,
}: {
  model: MLModel;
  onActivate: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 shadow-sm transition-all",
        model.isActive
          ? "border-secondary/60 ring-2 ring-secondary/30"
          : "hover:border-primary/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">{model.name}</p>
            {model.isActive && (
              <span className="flex items-center gap-1 rounded-full bg-secondary/20 px-2 py-0.5 text-[10px] font-bold text-secondary">
                <Zap className="h-3 w-3" /> AKTIF
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {model.algorithm} · v{model.version}
          </p>
        </div>
        {model.accuracy !== null && (
          <div className="text-right shrink-0">
            <p className="text-[10px] text-muted-foreground">Akurasi</p>
            <p className="text-lg font-black text-secondary">
              {model.accuracy?.toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      {model.description && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{model.description}</p>
      )}

      <p className="mt-2 text-[10px] text-muted-foreground">
        {model.originalFilename} · Upload: {new Date(model.uploadedAt).toLocaleDateString("id-ID")}
      </p>

      <div className="mt-4 flex gap-2">
        {!model.isActive && (
          <button
            onClick={onActivate}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-secondary/10 px-3 py-2 text-xs font-semibold text-secondary transition-colors hover:bg-secondary/20"
          >
            <Zap className="h-3.5 w-3.5" /> Aktifkan
          </button>
        )}
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {model.isActive ? "Hapus" : ""}
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ModelsPage() {
  const { user } = useAuth();
  const [models, setModels] = useState<MLModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadModels = () => {
    setLoading(true);
    fetchMLModels().then(setModels).finally(() => setLoading(false));
  };

  useEffect(() => { loadModels(); }, []);

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-20 text-muted-foreground">
        <BrainCircuit className="h-10 w-10 opacity-30" />
        <p>Halaman ini hanya untuk Admin.</p>
      </div>
    );
  }

  const handleActivate = async (id: number) => {
    setActionId(id);
    try {
      await activateMLModel(id);
      setMessage("Model berhasil diaktifkan!");
      loadModels();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal mengaktifkan.");
    } finally {
      setActionId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus model "${name}"?`)) return;
    setActionId(id);
    try {
      await deleteMLModel(id);
      setMessage(`Model "${name}" dihapus.`);
      loadModels();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal menghapus.");
    } finally {
      setActionId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Kelola Model ML</h2>
        <p className="text-sm text-muted-foreground">
          Upload model scikit-learn (.pkl / .joblib) dan aktifkan untuk digunakan dalam prediksi mahasiswa.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
        <div>
          <p className="font-semibold text-primary">Format model yang didukung</p>
          <p className="text-muted-foreground mt-0.5">
            Model harus kompatibel dengan scikit-learn. Feature vector yang digunakan: age, is_married, is_employed, avg_ips, ips_drop, current_semester.
          </p>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-secondary/30 bg-secondary/10 p-3 text-sm text-secondary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      <UploadModelCard onUploaded={(m) => { setModels((p) => [m, ...p]); setMessage(`Model "${m.name}" berhasil diupload!`); }} />

      {/* Model list */}
      <div>
        <p className="mb-3 text-sm font-semibold text-muted-foreground">
          {models.length} model tersimpan
        </p>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : models.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-muted-foreground">
            <BrainCircuit className="h-10 w-10 opacity-30" />
            <p className="text-sm">Belum ada model yang diupload.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {models.map((m) => (
              <ModelCard
                key={m.id}
                model={m}
                onActivate={() => handleActivate(m.id)}
                onDelete={() => handleDelete(m.id, m.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
