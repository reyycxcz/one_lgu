import Link from "next/link";
import { ArrowLeft, Info, HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { DEPARTMENT_LABELS } from "@/lib/auth/departments";
import ResponseForm from "./response-form";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ requestId?: string }>;
}

export default async function NewResponsePage({ searchParams }: PageProps) {
  const { requestId } = await searchParams;
  if (!requestId) {
    redirect("/barangay/compliance");
  }

  const profile = await requireBarangaySection("compliance");
  const supabase = await createClient();

  // 1. Fetch document request details
  const { data: request, error: reqError } = await supabase
    .from("document_requests")
    .select("id, title, description, deadline, requesting_department_id")
    .eq("id", requestId)
    .maybeSingle();

  if (reqError || !request) {
    redirect("/barangay/compliance");
  }

  // 2. Verify if this barangay is a recipient
  const { data: recipient, error: recError } = await supabase
    .from("request_recipients")
    .select("id")
    .eq("request_id", requestId)
    .eq("barangay_id", profile.barangay_id || "")
    .maybeSingle();

  if (recError || !recipient) {
    return (
      <div className="p-6 text-center space-y-4">
        <h2 className="text-lg font-bold text-red-600">Access Denied</h2>
        <p className="text-sm text-muted-foreground">This document request is not addressed to your barangay.</p>
        <Link href="/barangay/compliance" className="text-primary hover:underline text-xs">
          Back to Compliance List
        </Link>
      </div>
    );
  }

  const departmentLabel = request.requesting_department_id
    ? (DEPARTMENT_LABELS[request.requesting_department_id as keyof typeof DEPARTMENT_LABELS] || request.requesting_department_id)
    : "LGU Department";

  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <Link
          href="/barangay/compliance"
          className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider text-foreground/60 hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Compliance
        </Link>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">Submit Document Response</h1>
        <p className="text-sm text-foreground/60 mt-1">
          Upload file attachments in response to department document requests.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form Column (Left 2/3) */}
        <div className="bg-white p-6 rounded-xl border border-border/60 shadow-xs lg:col-span-2 space-y-6">
          <div className="pb-4 border-b border-slate-100 space-y-2">
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold uppercase w-fit">
              Requested by: {departmentLabel}
            </span>
            <h2 className="text-base font-bold text-foreground">{request.title}</h2>
            {request.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">{request.description}</p>
            )}
          </div>

          <ResponseForm requestId={request.id} />
        </div>

        {/* Sidebar Info (Right 1/3) */}
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-border/40 space-y-4">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-foreground/80">
              <Info className="h-4.5 w-4.5 text-primary" /> Request details
            </h3>
            <ul className="space-y-3.5 text-xs text-foreground/75 font-sans leading-relaxed">
              <li>
                <strong>Requesting Department:</strong>
                <p className="text-muted-foreground mt-0.5">{departmentLabel}</p>
              </li>
              <li>
                <strong>Submission Deadline:</strong>
                <p className="text-amber-700 font-semibold mt-0.5">
                  {new Date(request.deadline).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </li>
              <li>
                <strong>Submission Status:</strong>
                <p className="text-muted-foreground mt-0.5">
                  Your submission is private and only visible to authorized members of the {departmentLabel} and LGU administrators.
                </p>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-border/40 space-y-3">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-foreground/80">
              <HelpCircle className="h-4.5 w-4.5 text-primary" /> Need Help?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ensure files do not exceed 10MB. Accepted file extensions are PDF, Excel (.xlsx, .xls), and CSV. 
              For questions regarding the required contents, please contact the requesting department directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
