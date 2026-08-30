"use client";

// Shared by both document-request creation forms — lets staff dispatch a
// one-time request to specific barangay(s) instead of always blasting it to
// every active barangay. Recurring requests (monthly/quarterly/annual)
// intentionally don't use this: those are compliance obligations expected
// from every barangay, so they stay "all active barangays" only.
export function BarangayRecipientPicker({
  barangays,
  mode,
  onModeChange,
  selected,
  onSelectedChange,
}: {
  barangays: { id: string; name: string }[];
  mode: "all" | "specific";
  onModeChange: (mode: "all" | "specific") => void;
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    onSelectedChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2">Recipients</label>
      <div className="flex gap-4 text-sm mb-2">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" name="recipientMode" checked={mode === "all"} onChange={() => onModeChange("all")} />
          All Active Barangays
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="radio" name="recipientMode" checked={mode === "specific"} onChange={() => onModeChange("specific")} />
          Specific Barangay(s)
        </label>
      </div>

      {mode === "specific" && (
        <div className="max-h-44 overflow-y-auto border border-input rounded-md p-2 space-y-1 bg-background">
          {barangays.length === 0 ? (
            <p className="text-xs text-muted-foreground p-1">No active barangays found.</p>
          ) : (
            barangays.map((b) => (
              <label key={b.id} className="flex items-center gap-2 px-1.5 py-1 rounded text-sm hover:bg-muted/50 cursor-pointer">
                <input type="checkbox" checked={selected.includes(b.id)} onChange={() => toggle(b.id)} />
                {b.name}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
