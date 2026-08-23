import { UserList } from "@/components/lgu/user-list";
import { requireSuperAdmin } from "@/lib/auth/session";
import { CreateDepartmentReceiverSheet } from "@/components/lgu/create-department-receiver-sheet";

export default async function MunicipalDepartmentsPage() {
  await requireSuperAdmin();
  return (
    <UserList
      title="Municipal Departments"
      description="LGU reviewer accounts assigned to a receiving department. Treasurer's, Planning & Development, Administrator's, and Mayor's Office automatically receive their matching report type; other departments are label-only until a document flow is defined for them."
      roles={["lgu_reviewer"]}
      showDepartment
      action={<CreateDepartmentReceiverSheet />}
    />
  );
}
