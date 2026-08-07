import { UserList } from "@/components/lgu/user-list";
import { requireSuperAdmin } from "@/lib/auth/session";

export default async function ResidentsPage() {
  await requireSuperAdmin();
  return (
    <UserList
      title="Residents"
      description="All resident accounts registered across the municipality."
      roles={["resident"]}
    />
  );
}
