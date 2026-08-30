import { UserList } from "@/components/lgu/user-list";
import { CreateResidentSheet } from "@/components/lgu/create-resident-sheet";
import { requireSuperAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function ResidentsPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: barangays } = await supabase
    .from("barangays")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  return (
    <UserList
      title="Residents"
      description="All resident accounts registered across the municipality. Activate or deactivate accounts, filter by barangay, or register new residents."
      roles={["resident"]}
      action={<CreateResidentSheet barangays={barangays || []} />}
    />
  );
}
