import { createClient } from "@/lib/supabase/server";
import BarangayDirectory from "./barangay-directory";

export default async function BarangayListPage() {
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
