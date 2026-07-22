import { UserList } from "@/components/lgu/user-list";

export default function ResidentsPage() {
  return (
    <UserList
      title="Residents"
      description="All resident accounts registered across the municipality."
      roles={["resident"]}
    />
  );
}
