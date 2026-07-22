import { DocumentList } from "@/components/lgu/document-list";

export default function PendingDocumentsPage() {
  return (
    <DocumentList
      title="Pending Documents"
      description="Uploaded documents awaiting LGU review."
      statuses={["submitted", "under_review"]}
    />
  );
}
