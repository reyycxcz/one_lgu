export default function LguBarangaysPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="micro-label">02 — BARANGAYS</span>
        <h1 className="font-pixel text-4xl uppercase tracking-wider mt-1">Barangay Registries</h1>
        <p className="text-sm text-foreground/60 mt-1">Add, update, and manage official profiles of all barangays.</p>
      </div>
      <div className="bryl-card p-12 flex items-center justify-center text-center">
        <p className="text-sm text-foreground/50 font-mono uppercase tracking-wider">Registered barangays will be loaded from Supabase</p>
      </div>
    </div>
  );
}
