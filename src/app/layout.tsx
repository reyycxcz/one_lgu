import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";
import { LenisProvider } from "@/components/providers/lenis-provider";
import "./globals.css";
import { NavigationEvents } from "@/components/navigation-events";
import { PwaRegister } from "@/components/pwa-register";

/* eGovPH design system fonts (extracted): Lexend = primary UI,
   Gilroy = display/headings, Roboto Medium = numbers/IDs */
const lexend = localFont({
  src: [
    { path: "../../public/fonts/lexend_regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/lexend_medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/lexend_semibold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/lexend_bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

const gilroy = localFont({
  src: [
    { path: "../../public/fonts/gilroy_regular.otf", weight: "400", style: "normal" },
    { path: "../../public/fonts/gilroy_medium.otf", weight: "500", style: "normal" },
    { path: "../../public/fonts/gilroy_semibold.otf", weight: "600", style: "normal" },
    { path: "../../public/fonts/gilroy_bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const robotoNumbers = localFont({
  src: [{ path: "../../public/fonts/roboto_medium_numbers.ttf", weight: "500", style: "normal" }],
  variable: "--font-numbers",
  display: "swap",
});

const SITE_URL = "https://one-lgu.vercel.app";
const SITE_TITLE = "OneLGU - Digital Portal for Dingras, Ilocos Norte";
const SITE_DESCRIPTION =
  "Request Barangay Clearances, Certificates of Residency and Indigency, file complaints, and track LGU compliance online — a secure G2C and G2G digital governance platform for the Municipality of Dingras, Ilocos Norte.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | OneLGU",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "OneLGU",
    "Dingras",
    "Ilocos Norte",
    "barangay clearance online",
    "certificate of residency",
    "certificate of indigency",
    "LGU portal",
    "barangay complaint online",
    "local government digital services Philippines",
  ],
  authors: [{ name: "Municipality of Dingras, Ilocos Norte" }],
  category: "government",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/images/logo/one_lgu.png",
    apple: "/icons/icon-192.png",
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "5AbKH3IP1Ig1P_BzzU16xK5fb_AfDHMiu2xyKQvhhvg",
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: SITE_URL,
    siteName: "OneLGU",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#00B15E",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  name: "OneLGU - Municipality of Dingras, Ilocos Norte",
  alternateName: "OneLGU",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo/one_lgu.png`,
  description: SITE_DESCRIPTION,
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Dingras, Ilocos Norte, Philippines",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dingras",
    addressRegion: "Ilocos Norte",
    addressCountry: "PH",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lexend.variable} ${gilroy.variable} ${robotoNumbers.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <LenisProvider>
          {children}
          <NavigationEvents />
        </LenisProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
