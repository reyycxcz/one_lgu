"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { BadgeWithDot } from "@/components/base/badges/badges";
import { TableCard } from "@/components/application/table/table-card";
import { PaginationPageMinimalCenter } from "@/components/application/pagination/pagination";
import { LguPageHeader } from "@/components/lgu/page-header";
import { BarangayFormSheet } from "@/components/lgu/barangay-form-sheet";
import { BarangayToggleActive } from "@/components/lgu/barangay-toggle-active";
import { Pencil } from "lucide-react";

interface Barangay {
  id: string;
  name: string;
  code: string;
  municipality: string;
  province: string;
  is_active: boolean;
}

const PER_PAGE = 10;

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
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
    <div className="space-y-6">
      <LguPageHeader
        title="Barangay Directory"
        description={`${totalBarangays} barangays · ${new Set(barangays.map(b => b.municipality)).size} municipalities · ${barangays.filter(b => b.is_active).length} active`}
        action={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                maxLength={100}
                className="pl-8 h-8 text-xs w-52"
              />
            </div>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
            <BarangayFormSheet mode="create" />
          </div>
        }
      />

      <TableCard.Root className="flex flex-col">
        <div className="overflow-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-muted/50 z-10">
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground w-12">#</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">Barangay</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">Municipality</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">Code</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground text-right">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm font-sans">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No barangays match your search.
                  </td>
                </tr>
              ) : (
                municipalities.map(municipality => {
                  const mBarangays = paginated.filter(b => b.municipality === municipality);
                  return [
                    <tr key={`header-${municipality}`} className="bg-muted/30">
                      <td colSpan={6} className="px-5 py-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-primary" />
                          <span className="text-xs font-semibold text-foreground/70">{municipality}</span>
                          <span className="text-xs text-muted-foreground">({mBarangays.length})</span>
                        </div>
                      </td>
                    </tr>,
                    ...mBarangays.map(bgy => {
                      rowNumber++;
                      return (
                        <tr key={bgy.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3 text-muted-foreground">{rowNumber}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <InitialsAvatar name={bgy.name} size={32} />
                              <span className="font-medium text-foreground">{bgy.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{municipality}</td>
                          <td className="px-5 py-3 text-muted-foreground text-xs">{bgy.code}</td>
                          <td className="px-5 py-3 text-right">
                            <BadgeWithDot color={bgy.is_active ? "success" : "gray"} size="sm">
                              {bgy.is_active ? "Active" : "Inactive"}
                            </BadgeWithDot>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <BarangayFormSheet
                                mode="edit"
                                barangay={bgy}
                                trigger={
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-secondary text-primary hover:bg-secondary/70 transition-colors">
                                    <Pencil className="h-3 w-3" /> Edit
                                  </span>
                                }
                              />
                              <BarangayToggleActive barangayId={bgy.id} isActive={bgy.is_active} />
                            </div>
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
