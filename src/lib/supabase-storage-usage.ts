import { createAdminClient } from "./supabase/admin";

const BUCKETS = ["attachments", "reports"] as const;

// Supabase's Storage API has no account-wide "usage" endpoint reachable with
// just the service-role key (that lives behind the separate Management API,
// which needs its own personal access token) — so this sums file sizes by
// paging through storage.list() on each bucket instead.
const PAGE_SIZE = 1000;

export interface SupabaseBucketUsage {
  bucket: string;
  bytes: number;
  fileCount: number;
}

export interface SupabaseStorageUsage {
  totalBytes: number;
  totalFiles: number;
  buckets: SupabaseBucketUsage[];
  limitBytes: number;
}

async function sumBucket(bucket: string): Promise<SupabaseBucketUsage> {
  const supabase = createAdminClient();
  let bytes = 0;
  let fileCount = 0;
  let offset = 0;

  // Cap the loop so a runaway bucket can't hang the page — 20k files is
  // already far beyond what this system is expected to hold.
  for (let page = 0; page < 20; page++) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list("", { limit: PAGE_SIZE, offset, sortBy: { column: "name", order: "asc" } });

    if (error || !data || data.length === 0) break;

    for (const obj of data) {
      const size = (obj.metadata as { size?: number } | null)?.size;
      if (typeof size === "number") {
        bytes += size;
        fileCount += 1;
      }
    }

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return { bucket, bytes, fileCount };
}

/**
 * Total Supabase Storage usage across the attachments + reports buckets.
 * limitBytes defaults to the Free-tier 1GB cap — override with
 * SUPABASE_STORAGE_LIMIT_GB if the project is on a paid plan.
 */
export async function getSupabaseStorageUsage(): Promise<SupabaseStorageUsage> {
  const buckets = await Promise.all(BUCKETS.map(sumBucket));
  const limitGb = Number(process.env.SUPABASE_STORAGE_LIMIT_GB) || 1;

  return {
    totalBytes: buckets.reduce((sum, b) => sum + b.bytes, 0),
    totalFiles: buckets.reduce((sum, b) => sum + b.fileCount, 0),
    buckets,
    limitBytes: limitGb * 1024 * 1024 * 1024,
  };
}
