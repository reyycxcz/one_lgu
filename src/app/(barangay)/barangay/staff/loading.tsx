import { BarangayTableSkeleton } from "@/components/barangay/page-skeleton";

export default function Loading() {
  return <BarangayTableSkeleton columns={4} rows={5} />;
}
