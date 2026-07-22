import { CertificationList } from "@/components/lgu/certification-list";

export default function IssuedCertificatesPage() {
  return (
    <CertificationList
      title="Issued Certificates"
      description="Certificates that have been generated, are ready for pickup, or already released."
      statuses={["generated", "ready_for_pickup", "released"]}
    />
  );
}
