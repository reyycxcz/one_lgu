import { Card, CardContent } from "@/components/ui/card";

export default function LguReportDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-black text-5xl uppercase tracking-wider mt-1">Review Report #{params.id.slice(0, 8)}</h1>
        <p className="text-sm text-muted-foreground mt-1">Evaluate the document file and submit an approval status decision.</p>
      </div>
      <Card>
        <CardContent className="py-16 flex items-center justify-center text-center">
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">Document review viewer and status action forms placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
}
