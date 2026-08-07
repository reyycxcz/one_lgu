import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { UserToggleActive } from "@/components/lgu/user-toggle-active";
import { AccountRequestActions } from "@/components/lgu/account-request-actions";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export async function UserList({
  title,
  description,
  roles,
  onlyInactive,
}: {
  title: string;
  description: string;
  roles?: string[];
  onlyInactive?: boolean;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, is_active, barangays(name)")
    .order("full_name", { ascending: true })
    .limit(1000);

  if (roles && roles.length > 0) {
    query = query.in("role", roles);
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
      <LguPageHeader title={title} description={description} />
      <Card>
        <CardContent className="p-0">
          <FilterableTable
            columns={[
              { label: "Name" },
              { label: "Barangay" },
              { label: "Email" },
              { label: "Phone" },
              { label: "Status", align: "right" },
              { label: "Actions", align: "right" },
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
