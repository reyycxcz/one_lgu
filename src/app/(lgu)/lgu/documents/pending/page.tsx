import { requireProfile } from "@/lib/auth/session";
import { getDepartmentReportTypes, type LguDepartment } from "@/lib/auth/departments";
import { DocumentList } from "@/components/lgu/document-list";

export default async function PendingDocumentsPage() {
  const profile = await requireProfile();
  const types = getDepartmentReportTypes(profile.department as LguDepartment | null) || undefined;

  return (
    <DocumentList
      title="Pending Documents"
      description="Uploaded documents awaiting LGU review."
      statuses={["submitted", "under_review"]}
      types={types}
      targetAudience="barangay_official"
    />
  );
}
