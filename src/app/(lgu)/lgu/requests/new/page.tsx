import { LguPageHeader } from "@/components/lgu/page-header";
import { RequestDocumentForm } from "@/components/lgu/request-document-form";

export default function CreateRequestPage() {
  return (
    <div className="space-y-6 animate-stagger-in">
      <LguPageHeader
        title="Create Document Request"
        description="Dispatch a document requirement to all active barangays. Officials will be notified and can submit the requested file directly."
      />
      <RequestDocumentForm />
    </div>
  );
}
