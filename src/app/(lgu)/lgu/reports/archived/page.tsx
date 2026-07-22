import { ReportList } from "@/components/lgu/report-list";

export default function ArchivedReportsPage() {
  return (
    <ReportList
      title="Archived Reports"
      description="Older reports moved to the archive."
      statuses={["archived"]}
    />
  );
}
