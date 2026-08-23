import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { notFound } from "next/navigation";
import { CertificatePrintView } from "./certificate-print-view";

// Only requests that have actually cleared approval have anything to print.
const PRINTABLE_STATUSES = ["approved", "generated", "ready_for_pickup", "released"];

export default async function GenerateCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireBarangaySection("certifications");
  const supabase = await createClient();

  // super_admin can also reach this page from the LGU-wide certification
  // lists (RowActions is shared), where profile.barangay_id is null — don't
  // filter the row lookup by it, just gate access afterward.
  const { data: request } = await supabase
    .from("certification_requests")
    .select("*, profiles!certification_requests_requester_id_fkey(full_name, address), barangays(name, municipality, province)")
    .eq("id", id)
    .single();

  const isOwnBarangay = profile.role === "super_admin" || request?.barangay_id === profile.barangay_id;

  if (!request || !isOwnBarangay || !PRINTABLE_STATUSES.includes(request.status)) {
    notFound();
  }

  const { data: captain } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("barangay_id", request.barangay_id)
    .eq("role", "barangay_official")
    .eq("position", "captain")
    .maybeSingle();

  const requester = request.profiles as unknown as { full_name: string; address: string | null } | null;
  const barangay = request.barangays as unknown as { name: string; municipality: string; province: string } | null;

  return (
    <CertificatePrintView
      requestId={request.id}
      status={request.status}
      type={request.type}
      purpose={request.purpose}
      requesterName={requester?.full_name || "—"}
      requesterAddress={requester?.address || null}
      barangayName={barangay?.name || "—"}
      municipality={barangay?.municipality || "Dingras"}
      province={barangay?.province || "Ilocos Norte"}
      captainName={captain?.full_name || null}
      approvedAt={request.approved_at}
    />
  );
}
