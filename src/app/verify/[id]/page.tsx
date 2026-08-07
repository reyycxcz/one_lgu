import Image from "next/image";
import { CheckCircle2, XCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

const CERT_TYPE_LABELS: Record<string, string> = {
  barangay_clearance: "Barangay Clearance",
  certificate_of_residency: "Certificate of Residency",
  certificate_of_indigency: "Certificate of Indigency",
  business_clearance: "Business Clearance",
  first_time_job_seeker: "First-Time Job Seeker Certificate",
  barangay_certificate: "Barangay Certificate",
  scholarship_certificate: "Scholarship Certificate",
};

// Public, unauthenticated verification page — reached by scanning the QR
// code printed on an issued certificate. Deliberately outside any auth-gated
// route group: the whole point is that a third party with no OneLGU account
// (an employer, another agency) can confirm a physical document is genuine.
// Uses the admin client to bypass RLS, but only ever exposes the minimal
// fields needed to confirm authenticity against the physical document in
// hand — never email, phone, address, or anything not already printed on it.
export default async function VerifyCertificatePage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();

  const { data: cert } = await supabase
    .from("certification_requests")
    .select("id, type, status, released_at, released_to, barangays(name, municipality), profiles!certification_requests_requester_id_fkey(full_name)")
    .eq("id", params.id)
    .single();

  const isValid = cert && cert.status === "released";
  const barangay = cert?.barangays as unknown as { name: string; municipality: string } | null;
  const requester = cert?.profiles as unknown as { full_name: string } | null;
  const typeLabel = cert ? CERT_TYPE_LABELS[cert.type] || cert.type.replace(/_/g, " ") : null;

  return (
    <div className="min-h-screen bg-[#F8FDF9] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-border rounded-2xl shadow-sm p-8 text-center space-y-5">
        <Image src="/images/logo/landscape_logo.png" alt="OneLGU" width={140} height={40} className="mx-auto h-9 w-auto object-contain" />

        {isValid ? (
          <>
            <div className="mx-auto h-14 w-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Genuine Document</h1>
              <p className="text-xs text-muted-foreground mt-1">This certificate was issued through OneLGU and matches our records.</p>
            </div>
            <div className="text-left bg-muted/40 rounded-xl p-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Document</span>
                <span className="font-semibold text-foreground text-right">{typeLabel}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Issued to</span>
                <span className="font-semibold text-foreground text-right">{cert.released_to || requester?.full_name || "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Barangay</span>
                <span className="font-semibold text-foreground text-right">{barangay?.name || "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Released</span>
                <span className="font-semibold text-foreground text-right">
                  {cert.released_at ? new Date(cert.released_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <XCircle className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Not a Verified Document</h1>
              <p className="text-xs text-muted-foreground mt-1">
                We couldn&apos;t confirm this certificate against our records. It may not exist, or has not yet been officially released.
              </p>
            </div>
          </>
        )}

        <p className="text-[10px] text-muted-foreground/70 pt-2 border-t border-border">
          OneLGU Certificate Verification — Municipality of Dingras, Ilocos Norte
        </p>
      </div>
    </div>
  );
}
