import { v2 as cloudinary } from "cloudinary";

// Falls back to leaving uploads on Supabase Storage (see lib/storage/upload.ts)
// when unconfigured — same no-op-until-configured pattern as the other
// integrations in this project (Turnstile, Upstash, Sentry).
export function isCloudinaryConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

let configured = false;
function ensureConfigured() {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export interface CloudinaryUploadResult {
  name: string;
  file_url: string;
  uploaded_at: string;
  public_id: string;
  bytes: number;
}

/**
 * Upload a single validated file (caller already checked size/mime) to
 * Cloudinary under the given folder. Server-side only — never expose the
 * API secret to the client.
 */
export async function uploadToCloudinary(
  file: File,
  folder: "attachments" | "reports"
): Promise<CloudinaryUploadResult | null> {
  ensureConfigured();

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: `onelgu/${folder}`,
      resource_type: "auto",
      // Keep the original name recognizable without letting user input
      // dictate the storage path directly.
      filename_override: file.name.replace(/[^a-zA-Z0-9._-]/g, "_"),
      use_filename: true,
      unique_filename: true,
    });

    return {
      name: file.name,
      file_url: result.secure_url,
      uploaded_at: new Date().toISOString(),
      public_id: result.public_id,
      bytes: result.bytes,
    };
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return null;
  }
}

export interface CloudinaryUsage {
  plan: string;
  creditsUsed: number;
  creditsLimit: number | null;
  // Cloudinary's free/plus plans don't have a storage-specific byte cap —
  // storage, bandwidth, and transformations all draw from one shared credit
  // pool (documented conversion: 1 credit ≈ 1GB storage). This is that pool
  // expressed as a storage ceiling *if every remaining credit went to
  // storage* — a ceiling, not a guarantee, since bandwidth/transforms share it.
  approxStorageLimitBytes: number | null;
  storageBytes: number;
  bandwidthBytes: number;
  requests: number;
  transformations: number;
  resourceCount: number;
}

/** Account-wide usage stats for the LGU storage status dashboard. */
export async function getCloudinaryUsage(): Promise<CloudinaryUsage | null> {
  ensureConfigured();
  try {
    const usage = await cloudinary.api.usage();
    const creditsLimit = usage.credits?.limit ?? null;
    return {
      plan: usage.plan,
      creditsUsed: usage.credits?.usage ?? 0,
      creditsLimit,
      approxStorageLimitBytes: creditsLimit ? creditsLimit * 1024 * 1024 * 1024 : null,
      storageBytes: usage.storage?.usage ?? 0,
      bandwidthBytes: usage.bandwidth?.usage ?? 0,
      requests: usage.requests ?? 0,
      transformations: usage.transformations?.usage ?? 0,
      resourceCount: usage.resources ?? 0,
    };
  } catch (err) {
    console.error("Cloudinary usage fetch error:", err);
    return null;
  }
}

export interface CloudinaryAsset {
  publicId: string;
  url: string;
  format: string;
  bytes: number;
  createdAt: string;
  folder: string;
}

/** Recent uploaded assets for the file browser view (paginated, newest first). */
export async function listCloudinaryAssets(
  maxResults = 50,
  nextCursor?: string
): Promise<{ assets: CloudinaryAsset[]; nextCursor: string | null } | null> {
  ensureConfigured();
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "onelgu/",
      max_results: maxResults,
      next_cursor: nextCursor,
      direction: "desc",
    });

    const assets: CloudinaryAsset[] = (result.resources || []).map((r: {
      public_id: string;
      secure_url: string;
      format: string;
      bytes: number;
      created_at: string;
      folder?: string;
    }) => ({
      publicId: r.public_id,
      url: r.secure_url,
      format: r.format,
      bytes: r.bytes,
      createdAt: r.created_at,
      folder: r.folder || "",
    }));

    return { assets, nextCursor: result.next_cursor || null };
  } catch (err) {
    console.error("Cloudinary list error:", err);
    return null;
  }
}
