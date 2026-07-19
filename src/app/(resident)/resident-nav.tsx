"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, AlertOctagon, Bell, User, LayoutDashboard, LogOut, Home, FilePlus2 } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/resident/dashboard", icon: LayoutDashboard },
  { label: "Certifications", href: "/resident/certifications", icon: FileText },
  { label: "Complaints", href: "/resident/complaints", icon: AlertOctagon },
  { label: "Notifications", href: "/resident/notifications", icon: Bell },
];

const portalItems = [
  { label: "Home", href: "/", icon: Home },
];

const accountItems = [
  { label: "My Profile", href: "/resident/profile", icon: User },
];

export default function ResidentNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-60 border-r border-border bg-white flex flex-col justify-between hidden md:flex sticky top-14 h-[calc(100vh-3.5rem)]">
        <nav className="p-4 space-y-1">
          {/* Back to Home */}
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium text-foreground/70 hover:bg-muted/40 rounded-lg transition-colors mb-2"
          >
            <Home className="h-4 w-4 text-foreground/50" />
            <span>Back to Home</span>
          </Link>

          <div className="px-3 py-2 text-[10px] font-sans font-bold tracking-wider text-foreground/40 uppercase">
            Navigation
          </div>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium rounded-lg transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted/40"
                }`}
              >
                <item.icon className={`h-4 w-4 ${active ? "text-primary" : "text-foreground/50"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="px-3 py-2 mt-4 text-[10px] font-sans font-bold tracking-wider text-foreground/40 uppercase">
            Account
          </div>
          {accountItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium rounded-lg transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted/40"
                }`}
              >
                <item.icon className={`h-4 w-4 ${active ? "text-primary" : "text-foreground/50"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-sans font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Link>
        </nav>
      </aside>

      {/* Mobile Floating Bottom Nav — eGovPH style with elevated center action */}
      <nav className="md:hidden fixed bottom-4 left-3 right-3 z-50">
        <div className="relative grid grid-cols-5 items-end bg-white/95 backdrop-blur-md border border-[#E3F2E7] rounded-2xl shadow-[0_4px_24px_rgba(20,61,42,0.12)] px-1 py-1">
          {[
            { label: "Home", href: "/resident/dashboard", icon: Home },
            { label: "Certs", href: "/resident/certifications", icon: FileText },
          ].map((item) => {
            const active = isActive(item.href) && !pathname.startsWith("/resident/certifications/new");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 py-1"
              >
                <item.icon className={`h-5.5 w-5.5 ${active ? "text-primary" : "text-foreground/60"}`} />
                <span className={`text-[10px] font-sans font-medium ${active ? "text-primary" : "text-foreground/50"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* Elevated center action */}
          <div className="relative flex flex-col items-center">
            <Link
              href="/resident/certifications/new"
              aria-label="Request Certificate"
              className="absolute -top-8 flex h-14 w-14 items-center justify-center rounded-full gradient-primary ring-4 ring-white shadow-[0_8px_20px_-4px_rgba(0,177,94,0.55)] transition-transform active:scale-95"
            >
              <FilePlus2 className="h-6 w-6 text-white" />
            </Link>
            <span className={`mt-7 pb-1.5 text-[10px] font-sans font-semibold ${
              pathname.startsWith("/resident/certifications/new") ? "text-primary" : "text-foreground/60"
            }`}>
              Request
            </span>
          </div>

          {[
            { label: "Reports", href: "/resident/complaints", icon: AlertOctagon },
            { label: "Profile", href: "/resident/profile", icon: User },
          ].map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 py-1"
              >
                <item.icon className={`h-5.5 w-5.5 ${active ? "text-primary" : "text-foreground/60"}`} />
                <span className={`text-[10px] font-sans font-medium ${active ? "text-primary" : "text-foreground/50"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
