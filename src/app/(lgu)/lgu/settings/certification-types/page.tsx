import { TypeCategoryList } from "@/components/lgu/type-category-list";

const CERTIFICATION_TYPES = [
  "barangay_clearance",
  "certificate_of_residency",
  "certificate_of_indigency",
  "business_clearance",
  "first_time_job_seeker",
  "barangay_certificate",
  "scholarship_certificate",
];

export default function CertificationTypesPage() {
  return (
    <TypeCategoryList
      title="Certification Types"
      description="Document types residents can request through the platform."
      table="certification_requests"
      column="type"
      values={CERTIFICATION_TYPES}
    />
  );
}
