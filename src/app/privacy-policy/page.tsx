import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { PrivacyPolicyContent } from "@/components/privacy-policy-content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How OneLGU collects, uses, and protects your personal data under the Data Privacy Act of 2012 (RA 10173).",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FDF9]">
      <header className="h-14 bg-white border-b border-border sticky top-0 z-10">
        <div className="h-full max-w-3xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/images/logo/landscape_logo.png" width={130} height={37} className="h-7 w-auto object-contain" alt="OneLGU" />
          </Link>
          <Link href="/" className="text-xs font-semibold text-foreground/60 hover:text-foreground flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-12 space-y-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">Privacy Policy</h1>
          <p className="text-sm text-foreground/55 mt-2">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <PrivacyPolicyContent />
      </main>
    </div>
  );
}
