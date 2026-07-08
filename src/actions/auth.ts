"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/auth.schema";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { error: error.message };

  // Fetch role and redirect to the correct portal
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.app_metadata?.role || user?.user_metadata?.role || "resident";

  if (role === "super_admin") {
    redirect("/lgu/dashboard");
  } else if (role === "barangay_official" || role === "sk_official") {
    redirect("/barangay/dashboard");
  } else {
    redirect("/resident/dashboard");
  }
}

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    barangayId: formData.get("barangayId"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        role: "resident",
      },
    },
  });

  if (authError) return { error: authError.message };

  if (authData.user) {
    // Create profile record
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      barangay_id: parsed.data.barangayId,
      role: "resident",
      full_name: parsed.data.fullName,
      email: parsed.data.email,
    });

    if (profileError) return { error: profileError.message };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
