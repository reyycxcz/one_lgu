import { CertificationList } from "@/components/lgu/certification-list";

export default function PendingCertificationsPage() {
  return (
    <CertificationList
      title="Pending Certification Requests"
      description="Requests awaiting barangay verification or LGU approval."
      statuses={["submitted", "verified"]}
    />
  );
}
