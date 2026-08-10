import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "OneLGU - Local Government Unit Portal",
    short_name: "OneLGU",
    description:
      "Unified modules for Reports Management, Compliance, Barangay Certifications, and Resident Complaints.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
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
    screenshots: [
      {
        src: "/screenshots/wide-home.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
        label: "OneLGU home — digital services for Dingras, Ilocos Norte",
      },
      {
        src: "/screenshots/narrow-home.png",
        sizes: "412x915",
        type: "image/png",
        form_factor: "narrow",
        label: "OneLGU home on mobile",
      },
      {
        src: "/screenshots/narrow-login.png",
        sizes: "412x915",
        type: "image/png",
        form_factor: "narrow",
        label: "Secure login with CAPTCHA protection",
      },
    ],
  };
}
