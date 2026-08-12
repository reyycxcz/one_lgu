import { requireSuperAdmin } from "@/lib/auth/session";
import { isCloudinaryConfigured, getCloudinaryUsage, listCloudinaryAssets } from "@/lib/cloudinary";
import { getSupabaseStorageUsage } from "@/lib/supabase-storage-usage";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Gauge, Repeat, Zap, FileImage, CloudOff, ExternalLink, Database } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function UsageBar({ used, limit, label }: { used: number; limit: number | null; label: string }) {
  const pct = limit ? Math.min(100, (used / limit) * 100) : null;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">
          {typeof used === "number" && used > 1000 && limit && limit > 1000
            ? `${formatBytes(used)} / ${formatBytes(limit)}`
            : `${used.toLocaleString()}${limit ? ` / ${limit.toLocaleString()}` : ""}`}
        </span>
      </div>
      {pct !== null && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default async function StorageStatusPage() {
  await requireSuperAdmin();

  const cloudinaryConfigured = isCloudinaryConfigured();

  const [supabaseUsage, cloudinaryUsage, cloudinaryAssets] = await Promise.all([
    getSupabaseStorageUsage(),
    cloudinaryConfigured ? getCloudinaryUsage() : Promise.resolve(null),
    cloudinaryConfigured ? listCloudinaryAssets(50) : Promise.resolve(null),
  ]);

  const cloudinaryStats = cloudinaryUsage
    ? [
        { label: "Storage Used", value: formatBytes(cloudinaryUsage.storageBytes), icon: HardDrive },
        { label: "Bandwidth (this cycle)", value: formatBytes(cloudinaryUsage.bandwidthBytes), icon: Gauge },
        { label: "Transformations", value: cloudinaryUsage.transformations.toLocaleString(), icon: Repeat },
        { label: "Total Assets", value: cloudinaryUsage.resourceCount.toLocaleString(), icon: FileImage },
      ]
    : [];

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Storage Status"
        description="Supabase Storage and Cloudinary usage, quotas, and uploaded files across the system."
      />

      {/* ─── Combined overview: max storage for both providers ─── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> Supabase Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <UsageBar
              used={supabaseUsage.totalBytes}
              limit={supabaseUsage.limitBytes}
              label="Storage used"
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total files</span>
              <span className="font-medium text-foreground">{supabaseUsage.totalFiles.toLocaleString()}</span>
            </div>
            <div className="space-y-1.5 pt-1 border-t border-border">
              {supabaseUsage.buckets.map((b) => (
                <div key={b.bucket} className="flex justify-between text-xs">
                  <span className="text-muted-foreground capitalize">{b.bucket}</span>
                  <span className="text-foreground">{formatBytes(b.bytes)} · {b.fileCount} files</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground pt-1">
              Limit shown is the Free-tier 1GB cap — set <code className="bg-muted px-1 rounded">SUPABASE_STORAGE_LIMIT_GB</code> if on a paid plan.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Cloudinary Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {!cloudinaryConfigured ? (
              <div className="flex flex-col items-center text-center gap-2 py-4">
                <CloudOff className="h-5 w-5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Not connected — new uploads use Supabase Storage only.</p>
              </div>
            ) : cloudinaryUsage ? (
              <>
                <UsageBar
                  used={cloudinaryUsage.storageBytes}
                  limit={cloudinaryUsage.approxStorageLimitBytes}
                  label="Storage used"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total files</span>
                  <span className="font-medium text-foreground">{cloudinaryUsage.resourceCount.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground pt-1 border-t border-border">
                  Cloudinary&apos;s {cloudinaryUsage.plan} plan shares one credit pool across storage, bandwidth, and
                  transformations (1 credit ≈ 1GB) — the limit above is what storage could reach if every remaining
                  credit went to it, not a dedicated storage cap.
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">Couldn&apos;t reach Cloudinary&apos;s usage API right now.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Cloudinary detail ─── */}
      {cloudinaryConfigured && cloudinaryUsage && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cloudinaryStats.map((s) => (
              <Card key={s.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Plan &amp; Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <Badge variant="outline" className="capitalize">{cloudinaryUsage.plan}</Badge>
              </div>
              <UsageBar used={cloudinaryUsage.creditsUsed} limit={cloudinaryUsage.creditsLimit} label="Credits used this cycle" />
              <div className="flex justify-between text-sm pt-1">
                <span className="text-muted-foreground">API requests (this cycle)</span>
                <span className="font-medium text-foreground">{cloudinaryUsage.requests.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ─── Cloudinary file browser ─── */}
      {cloudinaryConfigured && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Recent Cloudinary Files</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {!cloudinaryAssets || cloudinaryAssets.assets.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No files uploaded to Cloudinary yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-border">
                      <th className="pb-2 font-medium">File</th>
                      <th className="pb-2 font-medium">Folder</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Size</th>
                      <th className="pb-2 font-medium">Uploaded</th>
                      <th className="pb-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cloudinaryAssets.assets.map((a) => (
                      <tr key={a.publicId} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 pr-4 font-medium text-foreground truncate max-w-[220px]">
                          {a.publicId.split("/").pop()}
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">{a.folder.replace("onelgu/", "") || "—"}</td>
                        <td className="py-2.5 pr-4">
                          <Badge variant="outline" className="uppercase text-[10px]">{a.format}</Badge>
                        </td>
                        <td className="py-2.5 pr-4 text-muted-foreground">{formatBytes(a.bytes)}</td>
                        <td className="py-2.5 pr-4 text-muted-foreground">
                          {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="py-2.5">
                          <a href={a.url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
