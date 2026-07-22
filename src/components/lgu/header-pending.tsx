"use client";

import Link from "next/link";
import { ClipboardCheck, FileText, Scale, Award, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

export interface PendingCounts {
  certifications: number;
  reports: number;
  complaints: number;
}

export function HeaderPending({ pending }: { pending: PendingCounts }) {
  const total = pending.certifications + pending.reports + pending.complaints;

  const rows = [
    { label: "Certifications", count: pending.certifications, href: "/lgu/certifications/pending", icon: Award },
    { label: "Reports", count: pending.reports, href: "/lgu/reports/pending", icon: FileText },
    { label: "Complaints", count: pending.complaints, href: "/lgu/complaints/pending", icon: Scale },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-white hover:bg-muted/40 transition-colors text-xs font-semibold text-foreground/70">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <span className="hidden lg:inline">Pending</span>
          {total > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold tabular-nums">
              {total > 99 ? "99+" : total}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-0">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-bold text-foreground">Awaiting your action</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {total === 0 ? "You're all caught up 🎉" : `${total} item${total !== 1 ? "s" : ""} need review`}
          </p>
        </div>
        <div className="p-1.5">
          {rows.map((r) => (
            <Link
              key={r.label}
              href={r.href}
              className="flex items-center gap-3 px-2.5 py-2 rounded-md hover:bg-muted/50 transition-colors group"
            >
              <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <r.icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground flex-1">{r.label}</span>
              <span className={`text-xs font-bold tabular-nums ${r.count > 0 ? "text-primary" : "text-muted-foreground/50"}`}>
                {r.count}
              </span>
              <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
