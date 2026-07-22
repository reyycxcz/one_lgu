import { ComplaintList } from "@/components/lgu/complaint-list";

export default function ClosedCasesPage() {
  return (
    <ComplaintList
      title="Closed Complaint Cases"
      description="Cases formally closed by a barangay official."
      statuses={["closed"]}
    />
  );
}
