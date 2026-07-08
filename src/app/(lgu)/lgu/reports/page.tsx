export default function LguReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <span className="micro-label">03 — REPORTS REVIEW</span>
        <h1 className="font-pixel text-4xl uppercase tracking-wider mt-1">Review Submissions</h1>
        <p className="text-sm text-foreground/60 mt-1">Approve, reject, or archive monthly financial and accomplishment reports.</p>
      </div>
      <div className="bryl-card p-12 flex items-center justify-center text-center">
        <p className="text-sm text-foreground/50 font-mono uppercase tracking-wider">Reports pending review will be loaded from Supabase</p>
      </div>
    </div>
  );
}
