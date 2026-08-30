import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createAdminClient } from "@/lib/supabase/admin";

function getMimeType(fileName: string, targetUrl: string): string {
  const name = (fileName || targetUrl).toLowerCase();
  if (name.endsWith(".xlsx") || name.includes(".xlsx?")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
  if (name.endsWith(".xls") || name.includes(".xls?")) {
    return "application/vnd.ms-excel";
  }
  if (name.endsWith(".csv") || name.includes(".csv?")) {
    return "text/csv; charset=utf-8";
  }
  if (name.endsWith(".pdf") || name.includes(".pdf?")) {
    return "application/pdf";
  }
  if (name.endsWith(".png") || name.includes(".png?")) {
    return "image/png";
  }
  if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.includes(".jpg?") || name.includes(".jpeg?")) {
    return "image/jpeg";
  }
  if (name.endsWith(".webp") || name.includes(".webp?")) {
    return "image/webp";
  }
  if (name.endsWith(".docx") || name.includes(".docx?")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (name.endsWith(".doc") || name.includes(".doc?")) {
    return "application/msword";
  }
  return "application/octet-stream";
}

interface CloudinaryUrlInfo {
  cloudName: string;
  resourceType: "image" | "raw" | "video";
  deliveryType: string;
  version?: string;
  publicId: string;
  format?: string;
}

function parseCloudinaryUrl(urlStr: string): CloudinaryUrlInfo | null {
  try {
    const parsed = new URL(urlStr);
    if (!parsed.hostname.includes("cloudinary.com")) return null;

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 3) return null;

    const cloudName = parts[0];
    const resourceType = (parts[1] as "image" | "raw" | "video") || "image";
    const deliveryType = parts[2] || "upload";

    let rest = parts.slice(3);
    // Remove existing signature parts like s--...--
    rest = rest.filter((p) => !p.startsWith("s--"));

    let version: string | undefined = undefined;
    const cleanSegments: string[] = [];

    for (const seg of rest) {
      if (/^v\d+$/.test(seg)) {
        version = seg.substring(1);
      } else if (
        !seg.includes(",") &&
        !seg.startsWith("fl_") &&
        !seg.startsWith("w_") &&
        !seg.startsWith("q_") &&
        !seg.startsWith("c_")
      ) {
        cleanSegments.push(seg);
      }
    }

    const fullPath = cleanSegments.join("/");
    const formatMatch = fullPath.match(/\.([a-zA-Z0-9]+)$/);
    const format = formatMatch ? formatMatch[1] : undefined;

    return {
      cloudName,
      resourceType,
      deliveryType,
      version,
      publicId: fullPath,
      format,
    };
  } catch {
    return null;
  }
}

function resolveSafeFileName(rawName: string | null, targetUrl: string, detectedMime: string): string {
  let name = (rawName && rawName.trim() && rawName !== "document.pdf") ? rawName.trim() : "";

  if (!name) {
    try {
      const parsed = new URL(targetUrl);
      const last = decodeURIComponent(parsed.pathname.split("/").pop() || "");
      if (last && last.includes(".")) {
        name = last;
      }
    } catch {}
  }

  if (!name && rawName) {
    name = rawName.trim();
  }

  if (!name) {
    if (detectedMime.includes("spreadsheetml") || targetUrl.toLowerCase().includes(".xlsx")) {
      name = "document.xlsx";
    } else if (detectedMime.includes("excel") || targetUrl.toLowerCase().includes(".xls")) {
      name = "document.xls";
    } else if (detectedMime.includes("csv") || targetUrl.toLowerCase().includes(".csv")) {
      name = "document.csv";
    } else if (detectedMime.includes("pdf") || targetUrl.toLowerCase().includes(".pdf")) {
      name = "document.pdf";
    } else {
      name = "document";
    }
  }

  return name.replace(/[^\w\s.-]/gi, "_");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  const providedName = searchParams.get("name");
  const isDownload = searchParams.get("download") === "1";

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing file URL" }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(targetUrl);
    // Security: Only proxy from trusted storage origins
    const allowedHosts = [
      "res.cloudinary.com",
      "cloudinary.com",
      "supabase.co",
      "supabase.in",
      "localhost",
      "127.0.0.1",
    ];
    const isAllowed = allowedHosts.some(
      (host) => parsedUrl.hostname === host || parsedUrl.hostname.endsWith(`.${host}`)
    );

    if (!isAllowed) {
      return NextResponse.json({ error: "Disallowed storage host" }, { status: 403 });
    }

    // Configure Cloudinary if environment variables are set
    const hasCloudinaryConfig = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (hasCloudinaryConfig) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }

    let response: Response | null = null;

    // -------------------------------------------------------------
    // Strategy 1: Supabase Storage Handling
    // -------------------------------------------------------------
    if (parsedUrl.hostname.includes("supabase.co") || parsedUrl.hostname.includes("supabase.in")) {
      const match = parsedUrl.pathname.match(
        /\/storage\/v1\/object\/(?:public\/|authenticated\/|sign\/)?([^/]+)\/(.+)$/
      );

      if (match && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const bucket = match[1];
        const filePath = decodeURIComponent(match[2]);

        try {
          const supabase = createAdminClient();
          const bucketsToTry = [bucket, "reports", "attachments"];
          const tried = new Set<string>();

          for (const b of bucketsToTry) {
            if (tried.has(b)) continue;
            tried.add(b);

            const { data: blobData, error: dlError } = await supabase.storage
              .from(b)
              .download(filePath);

            if (blobData && !dlError && blobData.size > 0) {
              const buffer = await blobData.arrayBuffer();
              const initialMime = blobData.type || getMimeType(providedName || "", targetUrl);
              const resolvedFileName = resolveSafeFileName(providedName, targetUrl, initialMime);
              const finalMime = getMimeType(resolvedFileName, targetUrl);

              const isExcelOrCsv =
                resolvedFileName.toLowerCase().endsWith(".xlsx") ||
                resolvedFileName.toLowerCase().endsWith(".xls") ||
                resolvedFileName.toLowerCase().endsWith(".csv") ||
                targetUrl.toLowerCase().includes(".xlsx") ||
                targetUrl.toLowerCase().includes(".xls") ||
                targetUrl.toLowerCase().includes(".csv");

              // Excel/CSV files download directly for native Excel opening; PDFs open inline
              const disposition = (isDownload || isExcelOrCsv) ? "attachment" : "inline";

              return new Response(buffer, {
                status: 200,
                headers: {
                  "Content-Type": finalMime,
                  "Content-Disposition": `${disposition}; filename="${resolvedFileName}"`,
                  "Content-Length": buffer.byteLength.toString(),
                  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
                },
              });
            }
          }
        } catch (sbErr) {
          console.warn("Supabase admin download attempt failed, falling back to HTTP fetch:", sbErr);
        }
      }

      // Fallback Supabase HTTP fetch with authorization headers
      const sbHeaders: Record<string, string> = {
        "User-Agent": "OneLGU-Server-FileViewer/1.0",
      };
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        sbHeaders["apikey"] = process.env.SUPABASE_SERVICE_ROLE_KEY;
        sbHeaders["Authorization"] = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
      } else if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        sbHeaders["apikey"] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        sbHeaders["Authorization"] = `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`;
      }

      try {
        const sbRes = await fetch(targetUrl, { headers: sbHeaders });
        if (sbRes.ok) {
          response = sbRes;
        }
      } catch {}
    }

    // -------------------------------------------------------------
    // Strategy 2: Direct HTTP Fetch
    // -------------------------------------------------------------
    if (!response || !response.ok) {
      try {
        const directRes = await fetch(targetUrl, {
          headers: {
            "User-Agent": "OneLGU-Server-FileViewer/1.0",
          },
        });
        if (directRes.ok) {
          response = directRes;
        }
      } catch (directErr) {
        console.warn("Direct fetch attempt failed:", directErr);
      }
    }

    // -------------------------------------------------------------
    // Strategy 3: Cloudinary Authenticated / Signed URL Retrieval
    // -------------------------------------------------------------
    if ((!response || !response.ok) && targetUrl.includes("cloudinary.com")) {
      const cldInfo = parseCloudinaryUrl(targetUrl);

      if (cldInfo) {
        const publicIdWithExt = cldInfo.publicId;
        const publicIdNoExt = cldInfo.publicId.replace(/\.[^/.]+$/, "");
        const ext = cldInfo.format || (providedName ? providedName.split(".").pop() : "") || "pdf";

        const candidateUrls: string[] = [];

        // 1. First, check Cloudinary Admin API to find exact resource metadata
        if (hasCloudinaryConfig) {
          let assetInfo: any = null;
          const lookups = [
            { id: publicIdWithExt, type: "raw" },
            { id: publicIdNoExt, type: "image" },
            { id: publicIdWithExt, type: "image" },
            { id: publicIdNoExt, type: "raw" },
          ];

          for (const lookup of lookups) {
            try {
              const res = await cloudinary.api.resource(lookup.id, {
                resource_type: lookup.type,
              });
              if (res && res.public_id) {
                assetInfo = res;
                break;
              }
            } catch {
              // Try next lookup
            }
          }

          if (assetInfo) {
            try {
              // Generated exact signed URL from Cloudinary metadata
              const exactSignedUrl = cloudinary.url(assetInfo.public_id, {
                resource_type: assetInfo.resource_type,
                type: assetInfo.type || "upload",
                version: assetInfo.version ? String(assetInfo.version) : undefined,
                format: assetInfo.resource_type === "image" ? (assetInfo.format || ext) : undefined,
                sign_url: true,
                secure: true,
              });
              if (exactSignedUrl) candidateUrls.push(exactSignedUrl);

              // Private download URL
              const privUrl = cloudinary.utils.private_download_url(
                assetInfo.public_id,
                assetInfo.format || ext,
                {
                  resource_type: assetInfo.resource_type,
                  type: assetInfo.type || "upload",
                  expires_at: Math.floor(Date.now() / 1000) + 3600,
                }
              );
              if (privUrl) candidateUrls.push(privUrl);

              if (assetInfo.secure_url) candidateUrls.push(assetInfo.secure_url);
            } catch (genErr) {
              console.warn("Error generating signed URL from asset info:", genErr);
            }
          }

          // Generate heuristic signed URLs if asset lookup didn't succeed or to add variants
          try {
            // Signed RAW URL with extension
            candidateUrls.push(
              cloudinary.url(publicIdWithExt, {
                resource_type: "raw",
                type: "upload",
                version: cldInfo.version,
                sign_url: true,
                secure: true,
              })
            );
            // Signed RAW URL without version
            candidateUrls.push(
              cloudinary.url(publicIdWithExt, {
                resource_type: "raw",
                type: "upload",
                sign_url: true,
                secure: true,
              })
            );
            // Signed RAW without extension
            candidateUrls.push(
              cloudinary.url(publicIdNoExt, {
                resource_type: "raw",
                type: "upload",
                sign_url: true,
                secure: true,
              })
            );
            // Signed IMAGE URL
            candidateUrls.push(
              cloudinary.url(publicIdNoExt, {
                resource_type: "image",
                type: "upload",
                format: ext,
                version: cldInfo.version,
                sign_url: true,
                secure: true,
              })
            );
            // Signed IMAGE with fl_attachment
            candidateUrls.push(
              cloudinary.url(publicIdNoExt, {
                resource_type: "image",
                type: "upload",
                format: ext,
                flags: "attachment",
                version: cldInfo.version,
                sign_url: true,
                secure: true,
              })
            );
            // Private download URL for raw
            candidateUrls.push(
              cloudinary.utils.private_download_url(publicIdWithExt, "", {
                resource_type: "raw",
                type: "upload",
                expires_at: Math.floor(Date.now() / 1000) + 3600,
              })
            );
          } catch (signErr) {
            console.warn("Cloudinary URL signing error:", signErr);
          }
        }

        // 2. Transformation URL variants
        if (targetUrl.includes("/image/upload/")) {
          candidateUrls.push(targetUrl.replace("/image/upload/", "/image/upload/fl_attachment/"));
          candidateUrls.push(targetUrl.replace("/image/upload/", "/raw/upload/"));
        } else if (targetUrl.includes("/raw/upload/")) {
          candidateUrls.push(targetUrl.replace("/raw/upload/", "/image/upload/"));
          candidateUrls.push(targetUrl.replace("/raw/upload/", "/image/upload/fl_attachment/"));
        }

        // Try candidate URLs
        for (const candUrl of candidateUrls) {
          if (!candUrl || candUrl === targetUrl) continue;
          try {
            const candRes = await fetch(candUrl, {
              headers: { "User-Agent": "OneLGU-Server-FileViewer/1.0" },
            });
            if (candRes.ok) {
              response = candRes;
              break;
            }
          } catch {
            // Continue trying other candidates
          }
        }

        // 3. Fallback: Basic Auth Header with Cloudinary API credentials
        if ((!response || !response.ok) && hasCloudinaryConfig) {
          try {
            const basicAuth = Buffer.from(
              `${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`
            ).toString("base64");
            const authRes = await fetch(targetUrl, {
              headers: {
                Authorization: `Basic ${basicAuth}`,
                "User-Agent": "OneLGU-Server-FileViewer/1.0",
              },
            });
            if (authRes.ok) {
              response = authRes;
            }
          } catch (authErr) {
            console.warn("Cloudinary basic auth attempt failed:", authErr);
          }
        }
      }
    }

    if (!response || !response.ok) {
      const status = response?.status || 404;
      const statusText = response?.statusText || "File not found or storage access denied";
      console.error(`Failed to fetch file from storage: ${targetUrl} (HTTP ${status} - ${statusText})`);
      return NextResponse.json(
        { error: `Unable to retrieve document (${statusText})` },
        { status: status === 401 || status === 403 ? 403 : status }
      );
    }

    const buffer = await response.arrayBuffer();
    const rawContentType = response.headers.get("content-type");
    const initialMime = rawContentType || getMimeType(providedName || "", targetUrl);
    const resolvedFileName = resolveSafeFileName(providedName, targetUrl, initialMime);
    const finalMime = getMimeType(resolvedFileName, targetUrl);

    const isExcelOrCsv =
      resolvedFileName.toLowerCase().endsWith(".xlsx") ||
      resolvedFileName.toLowerCase().endsWith(".xls") ||
      resolvedFileName.toLowerCase().endsWith(".csv") ||
      targetUrl.toLowerCase().includes(".xlsx") ||
      targetUrl.toLowerCase().includes(".xls") ||
      targetUrl.toLowerCase().includes(".csv");

    // Excel and spreadsheet files download directly as native Excel files; PDFs open inline in browser
    const disposition = (isDownload || isExcelOrCsv) ? "attachment" : "inline";

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": finalMime,
        "Content-Disposition": `${disposition}; filename="${resolvedFileName}"`,
        "Content-Length": buffer.byteLength.toString(),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal file viewer error";
    console.error("File viewer proxy error:", message);
    return NextResponse.json({ error: "Failed to load document" }, { status: 500 });
  }
}
