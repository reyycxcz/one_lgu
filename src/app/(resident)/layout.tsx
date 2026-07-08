import Link from "next/link";
import { ReactNode } from "react";
import { FileText, AlertOctagon, Bell, User, LayoutDashboard, LogOut } from "lucide-react";

export default function ResidentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border bg-white flex flex-col justify-between hidden md:flex sticky top-0 h-screen">
        <div>
          {/* Header */}
          <div className="h-16 px-6 border-b border-border flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary border border-border flex items-center justify-center font-pixel text-xl font-bold text-foreground">
              Ω
            </div>
            <span className="font-pixel text-xl tracking-wider text-foreground">ONELGU</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono font-bold tracking-wider text-foreground/40 uppercase">
              Main Menu
            </div>
            <Link 
              href="/resident/dashboard" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/resident/certifications" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Certifications</span>
            </Link>
            <Link 
              href="/resident/complaints" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors"
            >
              <AlertOctagon className="h-4 w-4" />
              <span>Complaints</span>
            </Link>
            <Link 
              href="/resident/notifications" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </Link>
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-sm text-foreground">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Juan Dela Cruz</p>
              <p className="text-[10px] font-mono uppercase text-foreground/50">Resident</p>
            </div>
          </div>

          <Link 
            href="/resident/profile" 
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors"
          >
            <User className="h-4 w-4" />
            <span>My Profile</span>
          </Link>

          <Link 
            href="/login" 
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 border-b border-border bg-white px-6 flex items-center justify-between md:hidden sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-primary border border-border flex items-center justify-center font-pixel text-lg font-bold text-foreground">
              Ω
            </div>
            <span className="font-pixel text-lg tracking-wider text-foreground">ONELGU</span>
          </div>

          {/* Simple Mobile Icons */}
          <div className="flex items-center gap-4">
            <Link href="/resident/notifications" className="p-1 hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
            </Link>
            <Link href="/resident/profile" className="p-1 hover:text-primary transition-colors">
              <User className="h-5 w-5" />
            </Link>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
