"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { announcementSchema } from "@/lib/validations/announcement.schema";
import { logAction } from "@/lib/audit/logger";
import { requireProfile } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { revalidatePath } from "next/cache";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function broadcastToResidents(announcementId: string, title: string, excerpt: string) {
  const admin = createAdminClient();

  const { data: residents } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "resident")
    .eq("is_active", true);

  if (!residents || residents.length === 0) return 0;

  const { error } = await admin.from("notifications").insert(
    residents.map((r) => ({
      recipient_id: r.id,
      title: `New Announcement: ${title}`,
      message: excerpt,
      type: "announcement",
      entity_type: "announcement",
      entity_id: announcementId,
    }))
  );

  if (error) {
    console.error("Failed to broadcast announcement notifications:", error);
    return 0;
  }

  return residents.length;
}

export async function createAnnouncement(formData: FormData) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can create announcements" };
  }

  const parsed = announcementSchema.safeParse({
    category: formData.get("category"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    tag: formData.get("tag"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const publish = formData.get("intent") === "publish";
  const supabase = await createClient();
  const baseSlug = slugify(parsed.data.title) || "announcement";
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from("announcements")
    .insert({
      author_id: profile.id,
      category: parsed.data.category,
      title: parsed.data.title,
      slug,
      excerpt: parsed.data.excerpt,
      tag: parsed.data.tag,
      body: parsed.data.body,
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  let recipientCount = 0;
  if (publish) {
    recipientCount = await broadcastToResidents(data.id, data.title, data.excerpt);
  }

  await logAction({
    actorId: profile.id,
    action: publish ? "announcement.published" : "announcement.drafted",
    entityType: "announcement",
    entityId: data.id,
    metadata: publish ? { recipientCount } : undefined,
  });

  revalidatePath("/lgu/announcements/sent");
  revalidatePath("/lgu/announcements/history");
  revalidatePath("/");

  return { data };
}

export async function archiveAnnouncement(id: string) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can archive announcements" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("announcements")
    .update({ status: "archived" })
    .eq("id", id);

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: "announcement.archived",
    entityType: "announcement",
    entityId: id,
  });

  revalidatePath("/lgu/announcements/sent");
  revalidatePath("/lgu/announcements/history");
  revalidatePath("/");

  return { success: true };
}

export async function publishAnnouncement(id: string) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can publish announcements" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("announcements")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  const recipientCount = await broadcastToResidents(data.id, data.title, data.excerpt);

  await logAction({
    actorId: profile.id,
    action: "announcement.published",
    entityType: "announcement",
    entityId: data.id,
    metadata: { recipientCount },
  });

  revalidatePath("/lgu/announcements/sent");
  revalidatePath("/lgu/announcements/history");
  revalidatePath("/");

  return { data };
}

export async function restoreAnnouncement(id: string) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can restore announcements" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("announcements")
    .update({ status: "published" })
    .eq("id", id);

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: "announcement.restored",
    entityType: "announcement",
    entityId: id,
  });

  revalidatePath("/lgu/announcements/sent");
  revalidatePath("/lgu/announcements/history");
  revalidatePath("/");

  return { success: true };
}
