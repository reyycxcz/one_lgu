export default function BarangayComplaintsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-black text-4xl uppercase tracking-wider mt-1">Complaint Cases</h1>
        <p className="text-sm text-foreground/60 mt-1">Track case assignments, schedules, and mediation logs.</p>
      </div>
      <div className="bryl-card p-12 flex items-center justify-center text-center">
        <p className="text-sm text-foreground/50 font-mono uppercase tracking-wider">Barangay mediation cases loaded from Supabase</p>
      </div>
    </div>
  );
}

