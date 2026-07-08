import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative flex-col justify-between p-12">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo/one_lgu.png"
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
              alt="OneLGU Logo"
            />
            <span className="font-sans font-bold text-xl tracking-tight text-white">ONELGU</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="font-sans text-4xl font-bold text-white leading-tight max-w-md">
            Digitalizing Local Government Services
          </h1>
          <p className="text-white/70 font-sans text-sm leading-relaxed max-w-md">
            Secure, paperless, and real-time administrative workflows connecting municipal admins, barangay officers, and residents.
          </p>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white/80 animate-pulse" />
            <span className="font-sans text-xs font-medium text-white/60 tracking-wider">LAOAG CITY NODES ONLINE</span>
          </div>
        </div>

        <div className="relative z-10 text-white/40 font-sans text-xs">
          © 2026 OneLGU Project
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 bg-white min-h-screen">
        {/* Mobile logo (only visible on small screens) */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <Image
            src="/images/logo/one_lgu.png"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
            alt="OneLGU Logo"
          />
          <span className="font-sans font-bold text-lg tracking-tight text-foreground">ONELGU</span>
        </div>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
