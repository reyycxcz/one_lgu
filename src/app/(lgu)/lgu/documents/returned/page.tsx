import { DocumentList } from "@/components/lgu/document-list";

export default function ReturnedDocumentsPage() {
  return (
    <DocumentList
      title="Returned Documents"
      description="Documents sent back to the barangay for correction."
      statuses={["rejected"]}
    />
  );
}
