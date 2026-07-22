import { DocumentList } from "@/components/lgu/document-list";

export default function ApprovedDocumentsPage() {
  return (
    <DocumentList
      title="Approved Documents"
      description="Documents reviewed and approved by the LGU."
      statuses={["approved"]}
    />
  );
}
