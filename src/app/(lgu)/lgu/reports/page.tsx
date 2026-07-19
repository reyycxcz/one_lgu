import { Card, CardContent } from "@/components/ui/card";

export default function LguReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-black text-4xl uppercase tracking-wider mt-1">Review Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Approve, reject, or archive monthly financial and accomplishment reports.</p>
      </div>
      <Card>
        <CardContent className="py-16 flex items-center justify-center text-center">
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">Reports pending review will be loaded from Supabase</p>
        </CardContent>
      </Card>
    </div>
  );
}

