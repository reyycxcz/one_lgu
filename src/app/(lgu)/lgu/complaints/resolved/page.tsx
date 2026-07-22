import { ComplaintList } from "@/components/lgu/complaint-list";

export default function ResolvedCasesPage() {
  return (
    <ComplaintList
      title="Resolved Complaint Cases"
      description="Cases that reached a settlement or resolution."
      statuses={["resolved"]}
    />
  );
}
