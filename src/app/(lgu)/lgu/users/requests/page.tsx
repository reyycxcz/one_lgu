import { UserList } from "@/components/lgu/user-list";

export default function AccountRequestsPage() {
  return (
    <UserList
      title="Account Requests"
      description="Accounts marked inactive, pending activation or review."
      onlyInactive
    />
  );
}
