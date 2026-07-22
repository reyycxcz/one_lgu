import { CertificationList } from "@/components/lgu/certification-list";

export default function ApprovedCertificationsPage() {
  return (
    <CertificationList
      title="Approved Certification Requests"
      description="Requests that have been approved and are being processed."
      statuses={["approved"]}
    />
  );
}
