"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface ImportResult {
  imported: number;
  total: number;
  skipped: number;
}

export default function ContactsImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(f: File) {
    if (!f.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }
    setFile(f);
    setResult(null);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/contacts/import", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Import failed");
      } else {
        setResult(data);
        toast.success(`Imported ${data.imported} contacts`);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">Import Contacts</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">CSV Format</p>
          <p>Your CSV should include these columns (case-insensitive):</p>
          <code className="text-xs mt-1 block text-blue-900">
            full_name, email, phone, company_name, city, country, source, tags
          </code>
          <p className="mt-1 text-xs">
            <strong>Required:</strong> full_name (or name), email. Duplicates (same email) will be
            updated.
          </p>
        </div>

        {/* Drop zone */}
        <div
          className={`bg-white border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
            dragOver ? "border-[#00C9A7] bg-teal-50" : "border-gray-200"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
        >
          {file ? (
            <div className="space-y-2">
              <FileText className="w-10 h-10 mx-auto text-[#00C9A7]" />
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setFile(null); setResult(null); }}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-sm text-muted-foreground">
                Drag & drop your CSV here, or{" "}
                <button
                  className="text-[#00C9A7] hover:underline font-medium"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse
                </button>
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-green-800">Import Complete</p>
              <p className="text-sm text-green-700">
                {result.imported} contacts imported · {result.skipped} skipped (duplicates or
                invalid rows)
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-[#0F1E3C] hover:bg-[#1a2f5e] text-white"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? "Importing..." : "Import Contacts"}
          </Button>
          {result && (
            <Button onClick={() => router.push("/contacts")}>
              View Contacts
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
