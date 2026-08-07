import { UserList } from "@/components/lgu/user-list";
import { requireSuperAdmin } from "@/lib/auth/session";

export default async function AccountRequestsPage() {
  await requireSuperAdmin();
  return (
    <UserList
      title="Account Requests"
      description="Accounts marked inactive, pending activation or review."
      onlyInactive
    />
  );
}
