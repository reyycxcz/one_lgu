import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";

export default async function LoginHistoryPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: authUsers }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers(),
    supabase.from("profiles").select("id, full_name, role, barangays(name)"),
  ]);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  const withLogin = authUsers.users
    .filter((u) => u.last_sign_in_at)
    .sort((a, b) => new Date(b.last_sign_in_at!).getTime() - new Date(a.last_sign_in_at!).getTime());

  const rows: FilterableRow[] = withLogin.map((u) => {
    const profile = profileMap.get(u.id);
    const barangay = profile?.barangays as unknown as { name: string } | null;
    const name = profile?.full_name || u.email || "—";
    return {
      searchText: `${name} ${u.email || ""}`,
      barangay: barangay?.name,
      cells: [
        <span key="name" className="font-medium">{name}</span>,
        <span key="email" className="text-muted-foreground">{u.email}</span>,
        <Badge key="role" variant="outline" className="capitalize">{profile?.role?.replace(/_/g, " ") || "—"}</Badge>,
        <span key="last" className="text-muted-foreground text-right">
          {new Date(u.last_sign_in_at!).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
        </span>,
      ],
    };
  });

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Login History"
        description="Most recent sign-in per account, from Supabase Auth."
      />
      <Card>
        <CardContent className="p-0">
          <FilterableTable
            columns={[
              { label: "Name" },
              { label: "Email" },
              { label: "Role" },
              { label: "Last Sign-In", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<History />}
            emptyMessage="No sign-in activity recorded yet."
            searchPlaceholder="Search name or email..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
