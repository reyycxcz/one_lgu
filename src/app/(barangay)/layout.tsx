import Link from "next/link";
import { ReactNode } from "react";
import { FileText, AlertOctagon, User, LayoutDashboard, LogOut, ClipboardList, ShieldAlert, FolderMinus } from "lucide-react";

export default function BarangayLayout({ children }: { children: ReactNode }) {
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
              Official Dashboard
            </div>
            <Link 
              href="/barangay/dashboard" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/barangay/reports" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors"
            >
              <ClipboardList className="h-4 w-4" />
              <span>Reports Submission</span>
            </Link>
            <Link 
              href="/barangay/documents" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors"
            >
              <FolderMinus className="h-4 w-4" />
              <span>LGU Documents</span>
            </Link>
            <Link 
              href="/barangay/certifications" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Cert Requests</span>
            </Link>
            <Link 
              href="/barangay/complaints" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors"
            >
              <AlertOctagon className="h-4 w-4" />
              <span>Complaints Case</span>
            </Link>
            <Link 
              href="/barangay/compliance" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Compliance Status</span>
            </Link>
            <Link 
              href="/barangay/staff" 
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-muted/40 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Staff Accounts</span>
            </Link>
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-sm text-foreground">
              SO
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Hon. Santiago O.</p>
              <p className="text-[10px] font-mono uppercase text-foreground/50">Barangay Captain</p>
            </div>
          </div>

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
          <Link href="/login" className="p-1 text-destructive">
            <LogOut className="h-5 w-5" />
          </Link>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
