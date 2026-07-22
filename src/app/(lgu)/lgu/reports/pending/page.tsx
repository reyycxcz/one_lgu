import { ReportList } from "@/components/lgu/report-list";

export default function PendingReportsPage() {
  return (
    <ReportList
      title="Pending Reports"
      description="Barangay reports awaiting LGU review."
      statuses={["submitted", "under_review"]}
    />
  );
}
