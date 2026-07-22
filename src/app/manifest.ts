import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OneLGU - Local Government Unit Portal",
    short_name: "OneLGU",
    description:
      "Unified modules for Reports Management, Compliance, Barangay Certifications, and Resident Complaints.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#00B15E",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
