import { ComplaintList } from "@/components/lgu/complaint-list";

export default function UnderInvestigationPage() {
  return (
    <ComplaintList
      title="Complaint Cases Under Investigation"
      description="Cases under review, scheduled for hearing, or in mediation."
      statuses={["under_review", "scheduled", "mediation"]}
    />
  );
}
