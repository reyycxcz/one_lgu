import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* ===== MOBILE: Full-screen form only ===== */}
      <div className="md:hidden min-h-screen bg-white flex flex-col justify-center px-6 py-10">
        <div className="w-full max-w-sm mx-auto">
          {children}
        </div>
      </div>

      {/* ===== DESKTOP: Centered split card ===== */}
      <div className="hidden md:flex min-h-screen bg-background flex-col justify-center items-center px-4 py-8 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(0,177,94,0.02)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        {/* Split Card */}
        <div className="w-full max-w-4xl bg-white rounded-none shadow-[0_4px_24px_rgba(20,61,42,0.02),0_1px_2px_rgba(20,61,42,0.02)] overflow-hidden flex flex-row border border-[#E9ECE9] z-10">
          
          {/* Left Side: Brand Panel */}
          <div className="w-1/2 bg-primary relative flex flex-col justify-between p-10 min-h-[460px] text-white">
            {/* Subtle overlay pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            
            <div className="relative z-10">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/images/logo/one_lgu.png"
                  width={36}
                  height={36}
                  className="h-9 w-auto object-contain"
                  alt="OneLGU Logo"
                />
                <span className="font-sans font-bold text-lg tracking-tight text-white">ONELGU</span>
              </Link>
            </div>

            <div className="relative z-10 space-y-4">
              <h1 className="font-sans text-3xl font-bold text-white leading-tight">
                Digitalizing Local Government
              </h1>
              <p className="text-white/75 font-sans text-xs leading-relaxed max-w-sm">
                Connecting municipal administrative systems, barangay official panels, and citizens in one secure, paperless workspace.
              </p>
            </div>

            <div />
          </div>

          {/* Right Side: Form Panel */}
          <div className="w-1/2 p-10 flex flex-col justify-center bg-white">
            {children}
          </div>

        </div>
      </div>
    </>
  );
}
