import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { UserToggleActive } from "@/components/lgu/user-toggle-active";
import { AccountRequestActions } from "@/components/lgu/account-request-actions";
import { DepartmentSelect } from "@/components/lgu/department-select";
import type { LguDepartment } from "@/lib/auth/departments";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export async function UserList({
  title,
  description,
  roles,
  positions,
  excludePositions,
  onlyInactive,
  showDepartment,
  action,
}: {
  title: string;
  description: string;
  roles?: string[];
  positions?: string[];
  excludePositions?: string[];
  onlyInactive?: boolean;
  showDepartment?: boolean;
  action?: React.ReactNode;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, department, is_active, barangays(name)")
    .order("full_name", { ascending: true })
    .limit(1000);

  if (roles && roles.length > 0) {
    query = query.in("role", roles);
  }
  if (positions && positions.length > 0) {
    query = query.in("position", positions);
  }
  if (excludePositions && excludePositions.length > 0) {
    query = query.or(`position.is.null,position.not.in.(${excludePositions.join(",")})`);
  }
  if (onlyInactive) {
    query = query.eq("is_active", false);
  }

  const { data: users } = await query;

  const rows: FilterableRow[] = (users || []).map((u) => {
    const barangay = u.barangays as unknown as { name: string } | null;
    return {
      searchText: `${u.full_name} ${u.email} ${barangay?.name || ""}`,
      barangay: barangay?.name,
      cells: [
        <span key="name" className="font-medium">{u.full_name}</span>,
        <span key="barangay" className="text-muted-foreground">{barangay?.name || "—"}</span>,
        <span key="email" className="text-muted-foreground">{u.email}</span>,
        <span key="phone" className="text-muted-foreground">{u.phone || "—"}</span>,
        ...(showDepartment
          ? [<DepartmentSelect key="department" userId={u.id} department={u.department as LguDepartment | null} />]
          : []),
        <Badge key="status" variant={u.is_active ? "default" : "outline"}>
          {u.is_active ? "Active" : onlyInactive ? "Pending" : "Inactive"}
        </Badge>,
        onlyInactive ? (
          <AccountRequestActions key="actions" userId={u.id} />
        ) : (
          <UserToggleActive key="actions" userId={u.id} isActive={u.is_active} />
        ),
      ],
    };
  });

  return (
    <div className="space-y-6">
      <LguPageHeader title={title} description={description} action={action} />
      <Card>
        <CardContent className="p-0">
          <FilterableTable
            columns={[
              { label: "Name" },
              { label: "Barangay" },
              { label: "Email" },
              { label: "Phone" },
              ...(showDepartment ? [{ label: "Department" }] : []),
              { label: "Status", align: "right" as const },
              { label: "Actions", align: "right" as const },
            ]}
            rows={rows}
            emptyIcon={<Users />}
            emptyMessage="No matching accounts yet."
            searchPlaceholder="Search name or email..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
