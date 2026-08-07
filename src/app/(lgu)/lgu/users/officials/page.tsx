import { UserList } from "@/components/lgu/user-list";
import { requireSuperAdmin } from "@/lib/auth/session";

export default async function BarangayOfficialsPage() {
  await requireSuperAdmin();
  return (
    <UserList
      title="Barangay Officials"
      description="Barangay official accounts registered across the municipality."
      roles={["barangay_official"]}
    />
  );
}
