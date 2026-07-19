"use client";

import { ReactNode, useState } from "react";
import {
  Search,
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  TrendingUp,
  Activity,
  Building2,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  FolderOpen,
  Upload,
  ListChecks,
  Award,
  AlertTriangle,
  Search as SearchIcon,
  ClipboardList,
  AlertCircle,
  History,
  PieChart,
  FileBarChart,
  FileSpreadsheet,
  Plus,
  Megaphone,
  Bell,
  UserCheck,
  UserPlus,
  UserCog,
  Settings,
  Database,
  UserCircle,
  Lock,
  LogOut,
} from "lucide-react";
import { Sidebar } from "@/components/shared/sidebar/sidebar";
import NotificationBell from "@/components/shared/notification-bell";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  TrendingUp,
  Activity,
  Building2,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  FolderOpen,
  Upload,
  ListChecks,
  Award,
  AlertTriangle,
  Search: SearchIcon,
  ClipboardList,
  AlertCircle,
  History,
  PieChart,
  FileBarChart,
  FileSpreadsheet,
  Plus,
  Megaphone,
  Bell,
  UserCheck,
  UserPlus,
  UserCog,
  Settings,
  Database,
  UserCircle,
  Lock,
  LogOut,
};

interface LGUClientLayoutProps {
  children: ReactNode;
  userProfile: { name: string; email: string };
  navGroups: { label: string; items: { path: string; label: string; icon: string }[] }[];
}

export default function LGUClientLayout({ children, userProfile, navGroups }: LGUClientLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  const resolvedNavGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      icon: ICON_MAP[item.icon],
    })),
  }));

  return (
    <div className="min-h-screen bg-[#f5f8f6] flex">
      <div className="hidden md:block sticky top-0 h-screen">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          user={{ name: userProfile.name, email: userProfile.email, role: "Super Admin" }}
          appTitle="ONELGU"
          appSubtitle="Ilocos Norte"
          navGroups={resolvedNavGroups}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-16 border-b border-border bg-white px-6 items-center justify-between sticky top-0 z-40 gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search barangays, requests, reports..."
                className="w-full h-9 rounded-lg border border-border bg-muted/60 pl-9 pr-3 text-xs font-medium placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell userId="" />
            <div className="flex items-center gap-3 pl-3 border-l border-border">
              <div className="text-right leading-none">
                <p className="text-xs font-bold text-foreground">{userProfile.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{userProfile.email}</p>
              </div>
              <img
                src={`https://api.dicebear.com/10.x/open-peeps/svg?seed=${userProfile.name}`}
                alt="Avatar"
                className="w-9 h-9 rounded-full border border-border bg-secondary"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 w-full max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}
