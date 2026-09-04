import { requireProfile } from "@/lib/auth/session";
import { getDepartmentReportTypes, type LguDepartment } from "@/lib/auth/departments";
import { DocumentList } from "@/components/lgu/document-list";

export default async function SkReturnedDocumentsPage() {
  const profile = await requireProfile();
  const types = getDepartmentReportTypes(profile.department as LguDepartment | null) || undefined;

  return (
    <DocumentList
      title="Returned Documents (SK)"
      description="Sangguniang Kabataan documents sent back for correction."
      statuses={["rejected", "returned"]}
      submissionStatuses={["returned", "resubmission_required"]}
      types={types}
      targetAudience="sk_official"
    />
  );
}
