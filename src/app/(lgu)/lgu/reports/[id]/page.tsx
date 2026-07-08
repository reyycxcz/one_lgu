export default function LguReportDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <span className="micro-label">03 — EVALUATION ACTIONS</span>
        <h1 className="font-pixel text-4xl uppercase tracking-wider mt-1">Review Report #{params.id.slice(0, 8)}</h1>
        <p className="text-sm text-foreground/60 mt-1">Evaluate the document file and submit an approval status decision.</p>
      </div>
      <div className="bryl-card p-8">
        <p className="text-sm text-foreground/50 font-mono uppercase tracking-wider text-center">Document review viewer and status action forms placeholder</p>
      </div>
    </div>
  );
}
