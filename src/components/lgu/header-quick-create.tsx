"use client";

import Link from "next/link";
import { Plus, Megaphone, Building2, FileText, Award, Scale } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const ACTIONS = [
  { label: "New Announcement", href: "/lgu/announcements/create", icon: Megaphone },
  { label: "Add Barangay", href: "/lgu/settings/barangays", icon: Building2 },
];

const JUMP = [
  { label: "Certification Types", href: "/lgu/settings/certification-types", icon: Award },
  { label: "Report Categories", href: "/lgu/settings/report-categories", icon: FileText },
  { label: "Complaint Categories", href: "/lgu/settings/complaint-categories", icon: Scale },
];

export function HeaderQuickCreate() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors text-xs font-semibold">
          <Plus className="h-4 w-4" />
          <span className="hidden lg:inline">Create</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Create
        </DropdownMenuLabel>
        {ACTIONS.map((a) => (
          <DropdownMenuItem key={a.href} asChild>
            <Link href={a.href} className="cursor-pointer">
              <a.icon className="h-4 w-4 text-primary" />
              {a.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Configure
        </DropdownMenuLabel>
        {JUMP.map((a) => (
          <DropdownMenuItem key={a.href} asChild>
            <Link href={a.href} className="cursor-pointer">
              <a.icon className="h-4 w-4 text-muted-foreground" />
              {a.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
