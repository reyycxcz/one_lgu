import type { MetadataRoute } from "next";

const SITE_URL = "https://one-lgu.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/resident/",
          "/lgu/",
          "/barangay/",
          "/dashboard",
          "/onboarding",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
