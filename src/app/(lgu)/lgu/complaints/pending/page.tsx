import { ComplaintList } from "@/components/lgu/complaint-list";

export default function PendingCasesPage() {
  return (
    <ComplaintList
      title="Pending Complaint Cases"
      description="Newly filed complaints awaiting initial review."
      statuses={["submitted"]}
    />
  );
}
