"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileCheck2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitReport } from "@/actions/reports";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

export default function ReportForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 10MB.");
      e.target.value = "";
      return;
    }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Only PDF, Excel, or CSV files are allowed.");
      e.target.value = "";
      return;
    }

    setError(null);
    setFile(selected);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please select a report file to upload.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const path = `${crypto.randomUUID()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("reports")
        .upload(path, file, { upsert: false });

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage.from("reports").getPublicUrl(path);

      const formData = new FormData(e.currentTarget);
      formData.set("file_url", publicUrl.publicUrl);
      formData.set("file_name", file.name);

      const result = await submitReport(formData);

      if (result?.error) {
        setError(typeof result.error === "string" ? result.error : "Please check the form for errors");
        setLoading(false);
        return;
      }

      router.push("/barangay/reports");
      router.refresh();
    } catch {
      setError("Something went wrong while submitting your report. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div role="alert" aria-live="assertive" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div>
        <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
          Report Title
        </label>
        <input
          type="text"
          name="title"
          placeholder="e.g. Q3 Financial Expense Breakdown, July Accomplishment Report..."
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          minLength={5}
          required
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <div>
          <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
            Report Type
          </label>
          <select
            name="type"
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            required
            defaultValue=""
          >
            <option value="" disabled>Select type...</option>
            <option value="monthly">Monthly Report</option>
            <option value="financial">Financial Report</option>
            <option value="accomplishment">Accomplishment Report</option>
            <option value="compliance">Compliance Report</option>
          </select>
        </div>

        <div>
          <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
            Period Start Date
          </label>
          <input
            type="date"
            name="period_start"
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            required
          />
        </div>

        <div>
          <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
            Period End Date
          </label>
          <input
            type="date"
            name="period_end"
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            required
          />
        </div>
      </div>

      <div>
        <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
          Report File Document
        </label>
        <label className="border border-dashed border-border rounded-xl p-8 bg-muted/10 flex flex-col items-center justify-center text-center space-y-3 hover:bg-muted/20 transition-all cursor-pointer">
          <input type="file" accept=".pdf,.xls,.xlsx,.csv" className="hidden" onChange={handleFileChange} />
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            {file ? <FileCheck2 className="h-5 w-5 text-primary" /> : <Upload className="h-5 w-5 text-foreground/80" />}
          </div>
          <div>
            <p className="text-sm font-semibold">{file ? file.name : "Click to upload report document"}</p>
            <p className="text-xs text-foreground/50 mt-1">Upload PDF or Spreadsheet (Excel/CSV up to 10MB)</p>
          </div>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full green-chip py-3 justify-center text-xs tracking-widest font-bold font-sans disabled:opacity-50"
      >
        {loading ? "SUBMITTING..." : "DISPATCH REPORT TO LGU REVIEWERS"}
      </button>
    </form>
  );
}
