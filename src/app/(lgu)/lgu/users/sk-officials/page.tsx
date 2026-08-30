import { UserList } from "@/components/lgu/user-list";
import { CreateOfficialSheet } from "@/components/lgu/create-official-sheet";
import { requireSuperAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function SkOfficialsPage() {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: barangays } = await supabase
    .from("barangays")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  return (
    <UserList
      title="SK Officials"
      description="Sangguniang Kabataan official accounts registered across the municipality."
      roles={["barangay_official"]}
      positions={["sk_chairman", "sk_secretary", "sk_treasurer"]}
      action={<CreateOfficialSheet barangays={barangays || []} />}
    />
  );
}
