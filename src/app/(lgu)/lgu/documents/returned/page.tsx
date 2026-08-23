import { requireProfile } from "@/lib/auth/session";
import { getDepartmentReportTypes, type LguDepartment } from "@/lib/auth/departments";
import { DocumentList } from "@/components/lgu/document-list";

export default async function ReturnedDocumentsPage() {
  const profile = await requireProfile();
  const types = getDepartmentReportTypes(profile.department as LguDepartment | null) || undefined;

  return (
    <DocumentList
      title="Returned Documents"
      description="Documents sent back to the barangay for correction."
      statuses={["rejected"]}
      submissionStatuses={["returned", "resubmission_required"]}
      types={types}
    />
  );
}
