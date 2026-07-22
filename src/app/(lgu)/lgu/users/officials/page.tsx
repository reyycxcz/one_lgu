import { UserList } from "@/components/lgu/user-list";

export default function BarangayOfficialsPage() {
  return (
    <UserList
      title="Barangay Officials"
      description="Barangay official accounts registered across the municipality."
      roles={["barangay_official"]}
    />
  );
}
