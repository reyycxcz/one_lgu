"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  FileText,
  ClipboardText,
  TrendUp,
  Pulse,
  Buildings,
  Users,
  ChartBar,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  FolderOpen,
  Upload,
  ListChecks,
  Medal,
  Warning,
  MagnifyingGlass,
  WarningCircle,
  ClockCounterClockwise,
  ChartPie,
  ChartBarHorizontal,
  FileXls,
  Plus as PlusIcon,
  Megaphone,
  Bell,
  UserCheck,
  UserPlus,
  UserGear,
  Gear,
  Database,
  UserCircle,
  Lock,
  SignOut,
} from "@phosphor-icons/react/dist/ssr";
import { Sidebar } from "@/components/shared/sidebar/sidebar";
import NotificationBell from "@/components/shared/notification-bell";
import { LiveClock } from "@/components/shared/live-clock";
import { HeaderGreeting } from "@/components/lgu/header-greeting";
import { HeaderPending, type PendingCounts } from "@/components/lgu/header-pending";
import { HeaderQuickCreate } from "@/components/lgu/header-quick-create";
import { HeaderProfileMenu } from "@/components/lgu/header-profile-menu";
import { signOut } from "@/actions/auth";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  LayoutDashboard: SquaresFour,
  FileText,
  ClipboardCheck: ClipboardText,
  TrendingUp: TrendUp,
  Activity: Pulse,
  Building2: Buildings,
  Users,
  BarChart3: ChartBar,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  FolderOpen,
  Upload,
  ListChecks,
  Award: Medal,
  AlertTriangle: Warning,
  Search: MagnifyingGlass,
  ClipboardList: ClipboardText,
  AlertCircle: WarningCircle,
  History: ClockCounterClockwise,
  PieChart: ChartPie,
  FileBarChart: ChartBarHorizontal,
  FileSpreadsheet: FileXls,
  Plus: PlusIcon,
  Megaphone,
  Bell,
  UserCheck,
  UserPlus,
  UserCog: UserGear,
  Settings: Gear,
  Database,
  UserCircle,
  Lock,
  LogOut: SignOut,
};

interface LGUClientLayoutProps {
  children: ReactNode;
  userProfile: { name: string; email: string; role: "super_admin" | "lgu_reviewer" };
  navGroups: { label: string; items: { path: string; label: string; icon: string }[] }[];
  pending: PendingCounts;
}

// Sidebar groups that only super_admin should see — lgu_reviewer's pages
// under these are gated server-side too (requireSuperAdmin), this just
// keeps the nav from listing links they can't actually open.
const SUPER_ADMIN_ONLY_GROUPS = new Set(["User Management", "System Management"]);

export default function LGUClientLayout({ children, userProfile, navGroups, pending }: LGUClientLayoutProps) {
  const pathname = usePathname();
  const isSuperAdmin = userProfile.role === "super_admin";

  const resolvedNavGroups = navGroups
    .filter((group) => isSuperAdmin || !SUPER_ADMIN_ONLY_GROUPS.has(group.label))
    .map((group) => ({
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
          user={{ name: userProfile.name, email: userProfile.email, role: isSuperAdmin ? "Super Admin" : "LGU Reviewer" }}
          appTitle="ONELGU"
          appSubtitle="Ilocos Norte"
          navGroups={resolvedNavGroups}
          onLogout={() => signOut()}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-16 border-b border-border bg-white px-6 items-center justify-between sticky top-0 z-40 gap-4">
          <div className="flex items-center gap-3">
            <HeaderGreeting name={userProfile.name} />
            <LiveClock />
          </div>
          <div className="flex items-center gap-3">
            <HeaderQuickCreate />
            <HeaderPending pending={pending} />
            <NotificationBell />
            <HeaderProfileMenu name={userProfile.name} email={userProfile.email} />
          </div>
        </header>

        <main key={pathname} className="flex-1 p-6 md:p-8 w-full max-w-none animate-page-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
