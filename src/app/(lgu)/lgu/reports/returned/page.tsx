import { ReportList } from "@/components/lgu/report-list";

export default function ReturnedReportsPage() {
  return (
    <ReportList
      title="Returned Reports"
      description="Reports sent back to the barangay for correction."
      statuses={["rejected", "returned"]}
    />
  );
}
