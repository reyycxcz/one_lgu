import { requireProfile } from "@/lib/auth/session";
import { getDepartmentReportTypes, type LguDepartment } from "@/lib/auth/departments";
import { DocumentList } from "@/components/lgu/document-list";

export default async function SkArchivedDocumentsPage() {
  const profile = await requireProfile();
  const types = getDepartmentReportTypes(profile.department as LguDepartment | null) || undefined;

  return (
    <DocumentList
      title="Archived Documents (SK)"
      description="Older Sangguniang Kabataan document submissions moved to the archive."
      statuses={["archived"]}
      submissionStatuses={["archived"]}
      types={types}
      targetAudience="sk_official"
    />
  );
}
