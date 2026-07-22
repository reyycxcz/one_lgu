import { UserList } from "@/components/lgu/user-list";

export default function SKOfficialsPage() {
  return (
    <UserList
      title="SK Officials"
      description="LGU reviewer / SK official accounts registered across the municipality."
      roles={["lgu_reviewer"]}
    />
  );
}
