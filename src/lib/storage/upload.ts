import { createAdminClient } from "../supabase/admin";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export interface UploadedFile {
  name: string;
  file_url: string;
  uploaded_at: string;
}

/**
 * Upload resident-supplied attachments (certification requirements, complaint
 * evidence) to the "attachments" Storage bucket via the service-role admin
 * client. Server-side upload avoids needing a storage.objects INSERT RLS
 * policy and lets us re-validate type/size on the server (client checks are
 * bypassable). Returns the stored file descriptors; skips anything invalid.
 */
export async function uploadAttachments(files: File[]): Promise<UploadedFile[]> {
  const valid = files.filter(
    (f) => f && f.size > 0 && f.size <= MAX_BYTES && ALLOWED.includes(f.type)
  );
  if (valid.length === 0) return [];

  const supabase = createAdminClient();
  const uploaded: UploadedFile[] = [];

  for (const file of valid) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${crypto.randomUUID()}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("attachments")
      .upload(path, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("attachment upload error:", error.message);
      continue;
    }

    const { data } = supabase.storage.from("attachments").getPublicUrl(path);
    uploaded.push({
      name: file.name,
      file_url: data.publicUrl,
      uploaded_at: new Date().toISOString(),
    });
  }

  return uploaded;
}
