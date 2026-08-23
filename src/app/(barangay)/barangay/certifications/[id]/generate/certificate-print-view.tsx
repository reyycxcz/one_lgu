"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateCertificationStatus } from "@/actions/certifications";

const CERT_TYPE_TITLES: Record<string, string> = {
  barangay_clearance: "Barangay Clearance",
  certificate_of_residency: "Certificate of Residency",
  certificate_of_indigency: "Certificate of Indigency",
  business_clearance: "Business Clearance",
  first_time_job_seeker: "First-Time Job Seeker Certificate",
};

interface CertificatePrintViewProps {
  requestId: string;
  status: string;
  type: string;
  purpose: string;
  requesterName: string;
  requesterAddress: string | null;
  barangayName: string;
  municipality: string;
  province: string;
  captainName: string | null;
  approvedAt: string | null;
}

function certificateBody({
  type,
  requesterName,
  requesterAddress,
  barangayName,
  municipality,
  province,
  purpose,
}: Pick<CertificatePrintViewProps, "type" | "requesterName" | "requesterAddress" | "barangayName" | "municipality" | "province" | "purpose">) {
  const place = `Barangay ${barangayName}, ${municipality}, ${province}`;
  const resident = `${requesterName}${requesterAddress ? `, a resident of ${requesterAddress}` : `, a resident of ${place}`}`;

  switch (type) {
    case "barangay_clearance":
      return `This is to certify that ${resident}, is known to be of good moral character and has no derogatory record on file with this Barangay as of this date. This clearance is issued upon the request of the above-named person for ${purpose}.`;
    case "certificate_of_residency":
      return `This is to certify that ${resident}, is a bona fide resident of ${place}. This certification is issued upon the request of the above-named person for ${purpose}.`;
    case "certificate_of_indigency":
      return `This is to certify that ${resident}, belongs to an indigent family in this Barangay based on records and assessment on file with this office. This certification is issued upon the request of the above-named person for ${purpose}.`;
    case "business_clearance":
      return `This is to certify that ${resident}, is hereby granted clearance to operate a business within the jurisdiction of ${place}, subject to compliance with all applicable barangay, municipal, and national requirements. This clearance is issued upon the request of the above-named person for ${purpose}.`;
    case "first_time_job_seeker":
      return `This is to certify that ${resident}, is a first-time job seeker as defined under Republic Act No. 11261 (Republic Act "First-Time Jobseekers Assistance Act"), and is availing of the exemption privileges granted under said law. This certification is issued upon the request of the above-named person for ${purpose}.`;
    default:
      return `This is to certify that ${resident}. This certification is issued upon the request of the above-named person for ${purpose}.`;
  }
}

export function CertificatePrintView(props: CertificatePrintViewProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marked, setMarked] = useState(props.status !== "approved");

  const title = CERT_TYPE_TITLES[props.type] || props.type.replace(/_/g, " ");
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  async function handleMarkPrinted() {
    setError(null);
    setIsPending(true);
    const result = await updateCertificationStatus(props.requestId, "generated");
    setIsPending(false);
    if (result?.error) {
      setError(typeof result.error === "string" ? result.error : "Could not update status");
      return;
    }
    setMarked(true);
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 print:max-w-none print:mx-0 print:space-y-0">
      {/* Screen-only controls */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/barangay/certifications/${props.requestId}`}
          className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Request
        </Link>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-600">{error}</span>}
          {!marked && (
            <Button size="sm" variant="outline" disabled={isPending} onClick={handleMarkPrinted} className="cursor-pointer">
              <Check className="h-3.5 w-3.5" /> {isPending ? "Marking..." : "Mark as Printed"}
            </Button>
          )}
          <Button size="sm" onClick={() => window.print()} className="cursor-pointer">
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </div>

      {/* The actual certificate — this is what prints */}
      <div className="bg-white border border-border rounded-xl p-12 print:border-0 print:rounded-none print:p-16 space-y-8">
        <div className="text-center space-y-1 pb-6 border-b-2 border-foreground/80">
          <p className="text-[10px] uppercase tracking-widest text-foreground/60">Republic of the Philippines</p>
          <p className="text-[10px] uppercase tracking-widest text-foreground/60">Province of {props.province}</p>
          <p className="text-[10px] uppercase tracking-widest text-foreground/60">Municipality of {props.municipality}</p>
          <p className="text-sm font-bold uppercase tracking-wide mt-2">Office of the Barangay {props.barangayName}</p>
        </div>

        <h1 className="text-center text-2xl font-bold uppercase tracking-wide">{title}</h1>

        <p className="text-center text-sm font-semibold uppercase tracking-widest text-foreground/70">To Whom It May Concern:</p>

        <p className="text-sm leading-loose text-justify indent-8">
          {certificateBody(props)}
        </p>

        <p className="text-sm leading-loose text-justify indent-8">
          Issued this {today} at Barangay {props.barangayName}, {props.municipality}, {props.province}, upon the request of the interested party for whatever legal purpose it may serve.
        </p>

        <div className="flex justify-end pt-16">
          <div className="text-center space-y-1">
            <p className="text-sm font-bold uppercase">{props.captainName || "_______________________"}</p>
            <p className="text-[10px] uppercase tracking-wide text-foreground/60">Punong Barangay</p>
          </div>
        </div>
      </div>
    </div>
  );
}
