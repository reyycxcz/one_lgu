import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import ResidentNav from "./resident-nav";
import NotificationBell from "@/components/shared/notification-bell";

export default async function ResidentLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole(["resident"]);

  if (!profile.barangay_id) {
    redirect("/onboarding");
  }

  const userName = profile.full_name || profile.email || "Resident";

  return (
    <div className="min-h-screen bg-[#F8FDF9] flex flex-col">
      <header className="pt-8 pb-4 md:py-0 md:h-14 bg-transparent md:bg-white md:border-b md:border-border md:sticky md:top-0 z-50">
        <div className="h-full max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo/landscape_logo.png"
              width={340}
              height={97}
              className="h-9 md:h-8 w-auto object-contain ml-2 md:ml-0"
              alt="OneLGU Logo"
            />
            <div className="hidden md:block h-5 w-px bg-border" />
            <span className="hidden md:block font-sans text-sm font-semibold text-foreground">Resident Portal</span>
          </div>

          <div className="flex items-center gap-2.5">
            <NotificationBell />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <ResidentNav />

        <main className="flex-1 min-w-0 p-4 md:p-8 pb-32 md:pb-8 max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}
