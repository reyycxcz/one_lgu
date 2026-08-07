"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, AlertOctagon, Bell, User, FilePlus2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const services = [
  { label: "Request Barangay Clearance", href: "/resident/certifications/new", keywords: "certificate clearance new request", icon: FilePlus2 },
  { label: "Request Certificate of Residency", href: "/resident/certifications/new", keywords: "certificate residency proof address", icon: FilePlus2 },
  { label: "Request Certificate of Indigency", href: "/resident/certifications/new", keywords: "certificate indigency assistance", icon: FilePlus2 },
  { label: "File a Complaint", href: "/resident/complaints/new", keywords: "report incident grievance blotter", icon: AlertOctagon },
  { label: "My Certifications", href: "/resident/certifications", keywords: "history track status documents", icon: FileText },
  { label: "My Complaints", href: "/resident/complaints", keywords: "history track status reports", icon: AlertOctagon },
  { label: "Notifications", href: "/resident/notifications", keywords: "alerts updates", icon: Bell },
  { label: "Profile Settings", href: "/resident/profile", keywords: "account name barangay", icon: User },
];

export default function ServiceSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const matches = query.trim()
    ? services.filter((s) =>
        `${s.label} ${s.keywords}`.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  function handleSelect(href: string) {
    setQuery("");
    router.push(href);
  }

  function handleBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setQuery("");
    }
  }

  return (
    <div className="relative" ref={containerRef} onBlur={handleBlur}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 pointer-events-none" />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        maxLength={100}
        onKeyDown={(e) => {
          if (e.key === "Escape") setQuery("");
          if (e.key === "Enter" && matches.length > 0) handleSelect(matches[0].href);
        }}
        placeholder="Search services, e.g. Clearance"
        className="h-11 rounded-full bg-white border-[#E3F2E7] shadow-sm pl-10 pr-4 text-sm"
      />

      {matches.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-border rounded-xl shadow-lg z-40 overflow-hidden">
          {matches.map((s) => (
            <button
              key={`${s.href}-${s.label}`}
              type="button"
              onClick={() => handleSelect(s.href)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
