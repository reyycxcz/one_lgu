import { ReportList } from "@/components/lgu/report-list";

export default function ApprovedReportsPage() {
  return (
    <ReportList
      title="Approved Reports"
      description="Reports reviewed and approved by the LGU."
      statuses={["approved"]}
    />
  );
}
