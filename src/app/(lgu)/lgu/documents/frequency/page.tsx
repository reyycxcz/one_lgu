import { FrequencyMonitoringList } from "@/components/lgu/frequency-monitoring-list";

export const dynamic = "force-dynamic";

export default async function BarangayFrequencyMonitoringPage() {
  return <FrequencyMonitoringList targetAudience="barangay_official" />;
}
