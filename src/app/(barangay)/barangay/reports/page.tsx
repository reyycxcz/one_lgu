import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { DocumentRequestsCard } from "@/components/barangay/document-requests-card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function BarangayReportsPage() {
  const profile = await requireBarangaySection("reports");

  return (
    <div className="space-y-8 animate-stagger-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight">Reports</h1>
        <p className="text-sm text-foreground/60 mt-1">Respond to document requests from LGU departments below, and track review decisions here.</p>
      </div>

      <DocumentRequestsCard barangayId={profile.barangay_id} />

      <Link
        href="/barangay/documents"
        className="flex items-center justify-between bg-white border border-border p-5 rounded-xl hover:bg-muted/20 transition-colors"
      >
        <div>
          <h2 className="font-sans font-semibold text-sm text-foreground">Looking for a past submission?</h2>
          <p className="text-xs text-foreground/50 mt-0.5">View the full LGU document history, including approved and closed requests.</p>
        </div>
        <ArrowRight className="h-4 w-4 text-foreground/40 shrink-0" />
      </Link>
    </div>
  );
}
