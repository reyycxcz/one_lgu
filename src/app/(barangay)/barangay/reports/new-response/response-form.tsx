"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitDocumentResponseAction } from "@/actions/workflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, File, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function ResponseForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("requestId", requestId);
    formData.append("file", file);

    const result = await submitDocumentResponseAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    toast.success("Document response submitted successfully!");
    setLoading(false);
    router.push("/barangay/compliance");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div role="alert" aria-live="assertive" className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File Upload Zone */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-foreground/70">
          Upload Document <span className="text-red-500">*</span>
        </label>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            file ? "border-primary bg-primary/5" : "border-slate-300 hover:border-slate-400 bg-white"
          }`}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,.xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) {
                setFile(selected);
              }
            }}
          />
          <div className="flex flex-col items-center justify-center gap-2.5">
            {file ? (
              <>
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <File className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground line-clamp-1">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-slate-100 rounded-full text-slate-500">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Click to upload file</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Allowed formats: PDF, Excel, CSV (max 10MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Remarks Input */}
      <div>
        <label className="block text-xs font-semibold text-foreground/70 mb-1.5">
          Submission Remarks (Optional)
        </label>
        <textarea
          name="remarks"
          rows={4}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="e.g. Attached is the requested list for Barangay A. Please let us know if any revisions are needed."
        />
      </div>

      {/* Submit button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
          className="text-xs cursor-pointer h-9 px-4"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="text-xs cursor-pointer h-9 px-6 bg-primary hover:bg-primary/90 text-white font-bold"
        >
          {loading ? "Uploading..." : "Submit Response"}
        </Button>
      </div>
    </form>
  );
}
