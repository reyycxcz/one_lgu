import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";
import { LenisProvider } from "@/components/providers/lenis-provider";
import "./globals.css";
import { NavigationEvents } from "@/components/navigation-events";

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

export const metadata: Metadata = {
  title: "OneLGU - Local Government Unit Portal",
  description: "Unified modules for Reports Management, Compliance, Barangay Certifications, and Resident Complaints.",
  icons: {
    icon: "/images/logo/one_lgu.png",
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
        <LenisProvider>
          {children}
          <NavigationEvents />
        </LenisProvider>
      </body>
    </html>
  );
}
