"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { SquaresFour, FileArrowUp, FolderOpen, Signature, Scales, Pulse, AddressBook, SealCheck, Package, CalendarCheck, Wrench } from "@phosphor-icons/react/dist/ssr";
import { Sidebar } from "@/components/shared/sidebar/sidebar";
import { MobileNavTrigger } from "@/components/shared/sidebar/mobile-nav-trigger";
import NotificationBell from "@/components/shared/notification-bell";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { signOut } from "@/actions/auth";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Grid: SquaresFour,
  FileUp: FileArrowUp,
  FolderOpen,
  FileSignature: Signature,
  Scale: Scales,
  Activity: Pulse,
  Contact: AddressBook,
  SealCheck,
  Package,
  CalendarClock: CalendarCheck,
  Wrench,
};

interface BarangayClientLayoutProps {
  children: ReactNode;
  userProfile: { name: string; email: string; barangayName: string; positionLabel: string };
  navGroups: { label: string; items: { path: string; label: string; icon: string }[] }[];
}

export default function BarangayClientLayout({ children, userProfile, navGroups }: BarangayClientLayoutProps) {
  const resolvedNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.map(item => ({
      ...item,
      icon: ICON_MAP[item.icon],
    })),
  }));

  return (
    <div className="min-h-screen bg-[#f5f8f6] flex print:block print:bg-white">
      <div className="hidden md:block sticky top-0 h-screen print:hidden">
        <Sidebar
          user={{ name: userProfile.name, email: userProfile.email, role: userProfile.positionLabel }}
          appSubtitle={userProfile.barangayName}
          navGroups={resolvedNavGroups}
          onLogout={() => signOut()}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 print:block">
        <header className="hidden md:flex h-16 border-b border-[#e3ede9] bg-white px-8 items-center justify-end sticky top-0 z-40 print:hidden">
          <div className="flex items-center gap-6">
            <NotificationBell />
            <div className="flex items-center gap-3">
              <div className="text-right leading-none">
                <p className="text-xs font-bold text-foreground">{userProfile.name}</p>
                <p className="text-[10px] text-foreground/50 mt-0.5">{userProfile.email}</p>
              </div>
              <InitialsAvatar name={userProfile.name} size={36} />
            </div>
          </div>
        </header>

        <header className="h-16 border-b border-[#e3ede9] bg-white px-4 flex items-center justify-between md:hidden sticky top-0 z-40 print:hidden">
          <div className="flex items-center gap-3">
            <MobileNavTrigger
              navGroups={resolvedNavGroups}
              user={{ name: userProfile.name, email: userProfile.email, role: userProfile.positionLabel }}
              appSubtitle={userProfile.barangayName}
              onLogout={() => signOut()}
            />
            <img
              src="/images/logo/o_icon.png"
              alt="OneLGU"
              className="h-8 w-8 object-contain"
            />
            <span className="font-sans font-bold text-lg tracking-wider text-foreground">ONELGU</span>
          </div>
          <Link href="/login" className="p-1 text-destructive">
            <LogOut className="h-5 w-5" />
          </Link>
        </header>

        <main className="flex-1 p-6 md:p-8 w-full max-w-none print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
