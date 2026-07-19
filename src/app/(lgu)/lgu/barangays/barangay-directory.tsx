"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge, BadgeWithDot } from "@/components/base/badges/badges";
import { TableCard } from "@/components/application/table/table-card";
import { PaginationPageMinimalCenter } from "@/components/application/pagination/pagination";

interface Barangay {
  id: string;
  name: string;
  code: string;
  municipality: string;
  province: string;
  is_active: boolean;
}

const PER_PAGE = 20;

export default function BarangayDirectory({ barangays, totalBarangays }: { barangays: Barangay[]; totalBarangays: number }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search) return barangays;
    const q = search.toLowerCase();
    return barangays.filter(
      b => b.name.toLowerCase().includes(q) || b.municipality.toLowerCase().includes(q) || b.code.includes(q)
    );
  }, [barangays, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  const municipalities = useMemo(() => {
    const seen = new Set<string>();
    return paginated.filter(b => {
      if (seen.has(b.municipality)) return false;
      seen.add(b.municipality);
      return true;
    }).map(b => b.municipality);
  }, [paginated]);

  let rowNumber = (page - 1) * PER_PAGE;

  return (
    <div className="flex flex-col h-full animate-stagger-in">
      <div className="flex items-center gap-6 pb-4">
        <h1 className="font-sans font-black text-4xl uppercase tracking-wider shrink-0">Barangay Directory</h1>
        <div className="h-6 w-px bg-border shrink-0" />
        <div className="flex items-center gap-4 text-sm">
          <span><strong>{totalBarangays}</strong> <span className="text-muted-foreground">barangays</span></span>
          <span className="text-muted-foreground">·</span>
          <span><strong>{new Set(barangays.map(b => b.municipality)).size}</strong> <span className="text-muted-foreground">municipalities</span></span>
          <span className="text-muted-foreground">·</span>
          <span className="text-green-600"><strong>{barangays.filter(b => b.is_active).length}</strong> <span className="text-green-600/70">active</span></span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 h-8 text-xs w-52"
            />
          </div>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <TableCard.Root className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-muted/50 z-10">
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-12">#</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Barangay</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Municipality</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Code</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-sans">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No barangays match your search.
                  </td>
                </tr>
              ) : (
                municipalities.map(municipality => {
                  const mBarangays = paginated.filter(b => b.municipality === municipality);
                  return [
                    <tr key={`header-${municipality}`} className="bg-muted/30">
                      <td colSpan={5} className="px-5 py-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">{municipality}</span>
                          <span className="text-[10px] text-muted-foreground">({mBarangays.length})</span>
                        </div>
                      </td>
                    </tr>,
                    ...mBarangays.map(bgy => {
                      rowNumber++;
                      return (
                        <tr key={bgy.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3 font-mono text-muted-foreground">{rowNumber}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={`https://api.dicebear.com/10.x/initials/svg?seed=${bgy.name}`}
                                alt={bgy.name}
                                size="sm"
                              />
                              <span className="font-medium text-foreground">{bgy.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{municipality}</td>
                          <td className="px-5 py-3 font-mono text-muted-foreground text-[11px]">{bgy.code}</td>
                          <td className="px-5 py-3 text-right">
                            <BadgeWithDot color={bgy.is_active ? "success" : "gray"} size="sm">
                              {bgy.is_active ? "Active" : "Inactive"}
                            </BadgeWithDot>
                          </td>
                        </tr>
                      );
                    }),
                  ];
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <PaginationPageMinimalCenter
            page={page}
            total={totalPages}
            onPageChange={setPage}
          />
        )}
      </TableCard.Root>
    </div>
  );
}
