"use client";

import { useState, useCallback } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/context/i18n-context";

export function DataUploadZone() {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      setUploaded(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploaded(false);
    }
  };

  const handleClear = () => {
    setUploadedFile(null);
    setUploaded(false);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsUploading(false);
    setUploaded(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Ingestion</CardTitle>
        <CardDescription>
          Upload file Excel atau CSV untuk mengimpor data mahasiswa baru ke
          sistem.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {uploadedFile ? (
          <div
            className={cn(
              "flex items-center gap-4 rounded-xl border p-4 transition-colors",
              uploaded
                ? "border-secondary/20 bg-secondary/10 dark:border-secondary dark:bg-secondary/20"
                : "border-border bg-muted/30",
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                uploaded
                  ? "bg-secondary/20 dark:bg-secondary/20"
                  : "bg-primary/20 dark:bg-primary/20",
              )}
            >
              {uploaded ? (
                <CheckCircle2 className="h-5 w-5 text-secondary dark:text-secondary" />
              ) : (
                <FileSpreadsheet className="h-5 w-5 text-primary dark:text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(uploadedFile.size / 1024).toFixed(1)} KB —{" "}
                {uploaded ? "Berhasil diproses" : "Siap untuk diupload"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {!uploaded && (
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="gap-1.5"
                >
                  {isUploading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Upload
                    </>
                  )}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClear}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="file-upload"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 text-center transition-all duration-150",
              isDragging
                ? "border-primary bg-primary/5 scale-[1.01]"
                : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30",
            )}
          >
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                isDragging ? "bg-primary/10" : "bg-muted",
              )}
            >
              {isDragging ? (
                <Upload className="h-6 w-6 text-primary" />
              ) : (
                <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {isDragging
                  ? "Lepaskan file di sini"
                  : "Drag & drop file, atau klik untuk memilih"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Mendukung format <span className="font-mono">.xlsx</span>,{" "}
                <span className="font-mono">.xls</span>, dan{" "}
                <span className="font-mono">.csv</span>
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </CardContent>
    </Card>
  );
}
