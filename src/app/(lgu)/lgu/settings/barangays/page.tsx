import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/session";
import BarangayDirectory from "@/app/(lgu)/lgu/barangays/barangay-directory";

export default async function BarangayManagementPage() {
  await requireSuperAdmin();
  const supabase = await createClient();

  const { data: barangays } = await supabase
    .from("barangays")
    .select("id, name, code, municipality, province, is_active")
    .order("name", { ascending: true });

  return (
    <BarangayDirectory
      barangays={barangays || []}
      totalBarangays={barangays?.length || 0}
    />
  );
}
