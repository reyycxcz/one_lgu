import { DocumentList } from "@/components/lgu/document-list";

export default function ArchivedDocumentsPage() {
  return (
    <DocumentList
      title="Archived Documents"
      description="Older document submissions moved to the archive."
      statuses={["archived"]}
    />
  );
}
