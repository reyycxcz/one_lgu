import { requireProfile } from "@/lib/auth/session";
import { getDepartmentReportTypes, type LguDepartment } from "@/lib/auth/departments";
import { DocumentList } from "@/components/lgu/document-list";

export default async function SkApprovedDocumentsPage() {
  const profile = await requireProfile();
  const types = getDepartmentReportTypes(profile.department as LguDepartment | null) || undefined;

  return (
    <DocumentList
      title="Approved Documents (SK)"
      description="Sangguniang Kabataan documents reviewed and approved by the LGU."
      statuses={["approved"]}
      types={types}
      targetAudience="sk_official"
    />
  );
}
