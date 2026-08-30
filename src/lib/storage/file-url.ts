/**
 * Generates reliable view and download URLs for uploaded documents and media.
 * Routes Cloudinary / Supabase PDF files through the server proxy endpoint
 * to bypass Cloudinary strict PDF delivery restrictions and ensure smooth
 * in-browser PDF viewing across all devices.
 */

export function getFileViewUrl(url: string | null | undefined, fileName?: string | null): string {
  if (!url) return "#";

  // If already an API proxy route, return as is
  if (url.startsWith("/api/")) return url;

  // Cloudinary image PDF URLs (which trigger 401 Strict PDF Delivery when opened directly)
  // route through our server proxy to stream properly inline in browser.
  const isCloudinary = url.includes("cloudinary.com");
  const isSupabase = url.includes("supabase.co") || url.includes("supabase.in");
  const isDocOrMedia =
    url.toLowerCase().match(/\.(pdf|xlsx?|csv|docx?|txt|png|jpe?g|webp)(\?|$)/i) !== null ||
    (fileName ? fileName.toLowerCase().match(/\.(pdf|xlsx?|csv|docx?|txt|png|jpe?g|webp)$/i) !== null : false);

  if (isCloudinary || isSupabase || isDocOrMedia) {
    const encodedUrl = encodeURIComponent(url);
    const encodedName = fileName ? `&name=${encodeURIComponent(fileName)}` : "";
    return `/api/files/view?url=${encodedUrl}${encodedName}`;
  }

  return url;
}

export function getFileDownloadUrl(url: string | null | undefined, fileName?: string | null): string {
  if (!url) return "#";
  const encodedUrl = encodeURIComponent(url);
  const encodedName = fileName ? `&name=${encodeURIComponent(fileName)}` : "";
  return `/api/files/view?download=1&url=${encodedUrl}${encodedName}`;
}
