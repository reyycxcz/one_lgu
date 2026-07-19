import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import { Plus, FileText, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const certTypeLabels: Record<string, string> = {
  barangay_clearance: "Barangay Clearance",
  certificate_of_residency: "Certificate of Residency",
  certificate_of_indigency: "Certificate of Indigency",
  business_clearance: "Business Clearance",
  first_time_job_seeker: "First Time Job Seeker",
};

export default async function ResidentCertificationsPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: certifications } = await supabase
    .from("certification_requests")
    .select("id, type, purpose, status, created_at")
    .eq("requester_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 animate-stagger-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">Certifications</h1>
          <p className="text-sm text-foreground/55 mt-1">Request and track your barangay documents.</p>
        </div>
        <Button asChild variant="default" className="text-xs font-bold self-start">
          <Link href="/resident/certifications/new">
            <Plus className="h-3.5 w-3.5" /> New Request
          </Link>
        </Button>
      </div>

      <div className="border border-border rounded-2xl bg-white divide-y divide-border">
        {certifications && certifications.length > 0 ? (
          certifications.map((cert) => (
            <Link
              key={cert.id}
              href={`/resident/certifications/${cert.id}`}
              className="flex items-center justify-between px-4 py-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{certTypeLabels[cert.type] || cert.type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-foreground/45 mt-0.5 truncate">{cert.purpose}</p>
                  <div className="flex items-center gap-1 text-[11px] text-foreground/40 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(cert.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[11px] font-medium capitalize px-2.5 py-1 rounded-full whitespace-nowrap ${
                  cert.status === "submitted" ? "bg-yellow-50 text-yellow-700" :
                  cert.status === "verified" ? "bg-blue-50 text-blue-700" :
                  cert.status === "approved" ? "bg-green-50 text-green-700" :
                  cert.status === "rejected" ? "bg-red-50 text-red-700" :
                  "bg-muted text-foreground/60"
                }`}>
                  {cert.status}
                </span>
                <ChevronRight className="h-4 w-4 text-foreground/30" />
              </div>
            </Link>
          ))
        ) : (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-foreground/50">No certifications yet.</p>
            <Link href="/resident/certifications/new" className="text-xs text-primary font-medium hover:underline mt-2 inline-block">Request your first certificate</Link>
          </div>
        )}
      </div>
    </div>
  );
}
