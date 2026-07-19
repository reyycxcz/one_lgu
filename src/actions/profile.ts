"use server";

import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";

export async function updateProfile(formData: FormData) {
  const session = await requireSession();
  const supabase = await createClient();

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const barangayCode = formData.get("barangayCode") as string;

  if (!fullName || !email) {
    return { error: "Full name and email are required" };
  }

  // If barangayCode is provided, look up the barangay_id
  let barangayId: string | null = null;
  if (barangayCode) {
    const { data: barangay } = await supabase
      .from("barangays")
      .select("id")
      .eq("code", barangayCode)
      .single();
    barangayId = barangay?.id || null;
  }

  const updateData: Record<string, string | null> = {
    full_name: fullName,
    email: email,
    phone: phone || null,
    address: address || null,
  };

  if (barangayCode) {
    updateData.barangay_id = barangayId;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", session.user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
