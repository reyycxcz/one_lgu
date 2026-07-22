import { CertificationList } from "@/components/lgu/certification-list";

export default function RejectedCertificationsPage() {
  return (
    <CertificationList
      title="Rejected Certification Requests"
      description="Requests that did not pass verification or approval."
      statuses={["rejected"]}
    />
  );
}
