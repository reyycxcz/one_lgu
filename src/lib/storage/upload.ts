import { createAdminClient } from "../supabase/admin";
import { isCloudinaryConfigured, uploadToCloudinary } from "../cloudinary";

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5MB
const ATTACHMENT_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const MAX_REPORT_BYTES = 10 * 1024 * 1024; // 10MB
const REPORT_TYPES = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

export interface UploadedFile {
  name: string;
  file_url: string;
  uploaded_at: string;
}

async function uploadOne(
  file: File,
  bucket: "attachments" | "reports"
): Promise<UploadedFile | null> {
  // New uploads go to Cloudinary when configured; existing Supabase-stored
  // files/URLs are left as-is (no migration) — both providers' URLs are
  // just opaque strings from the DB's point of view.
  if (isCloudinaryConfigured()) {
    const result = await uploadToCloudinary(file, bucket);
    if (result) {
      return { name: result.name, file_url: result.file_url, uploaded_at: result.uploaded_at };
    }
    // Cloudinary failed for this file — fall through to Supabase rather
    // than silently dropping the upload.
  }

  const supabase = createAdminClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${crypto.randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (error) {
    console.error(`${bucket} upload error:`, error.message);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { name: file.name, file_url: data.publicUrl, uploaded_at: new Date().toISOString() };
}

/**
 * Upload resident-supplied attachments (certification requirements, complaint
 * evidence). Server-side upload avoids needing a storage.objects INSERT RLS
 * policy and lets us re-validate type/size on the server (client checks are
 * bypassable). Returns the stored file descriptors; skips anything invalid.
 */
export async function uploadAttachments(files: File[]): Promise<UploadedFile[]> {
  const valid = files.filter(
    (f) => f && f.size > 0 && f.size <= MAX_ATTACHMENT_BYTES && ATTACHMENT_TYPES.includes(f.type)
  );
  if (valid.length === 0) return [];

  const results = await Promise.all(valid.map((f) => uploadOne(f, "attachments")));
  return results.filter((r): r is UploadedFile => r !== null);
}

/**
 * Upload a single barangay report document (PDF/Excel/CSV). Same
 * server-side-validated pattern as attachments — moved here from a
 * client-side direct-to-Supabase upload so Cloudinary can be used for both.
 */
export async function uploadReportFile(file: File): Promise<UploadedFile | null> {
  if (!file || file.size === 0 || file.size > MAX_REPORT_BYTES || !REPORT_TYPES.includes(file.type)) {
    return null;
  }
  return uploadOne(file, "reports");
}
