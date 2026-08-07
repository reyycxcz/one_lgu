import { UserList } from "@/components/lgu/user-list";
import { requireSuperAdmin } from "@/lib/auth/session";

export default async function SKOfficialsPage() {
  await requireSuperAdmin();
  return (
    <UserList
      title="SK Officials"
      description="LGU reviewer / SK official accounts registered across the municipality."
      roles={["lgu_reviewer"]}
    />
  );
}
