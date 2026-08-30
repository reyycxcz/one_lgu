import { requireProfile } from "@/lib/auth/session";
import { getDepartmentReportTypes, type LguDepartment } from "@/lib/auth/departments";
import { DocumentList } from "@/components/lgu/document-list";

export default async function ApprovedDocumentsPage() {
  const profile = await requireProfile();
  const types = getDepartmentReportTypes(profile.department as LguDepartment | null) || undefined;

  return (
    <DocumentList
      title="Approved Documents"
      description="Documents reviewed and approved by the LGU."
      statuses={["approved"]}
      types={types}
      targetAudience="barangay_official"
    />
  );
}
