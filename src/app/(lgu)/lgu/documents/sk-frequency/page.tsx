import { FrequencyMonitoringList } from "@/components/lgu/frequency-monitoring-list";

export const dynamic = "force-dynamic";

export default async function SkFrequencyMonitoringPage() {
  return <FrequencyMonitoringList targetAudience="sk_official" />;
}
