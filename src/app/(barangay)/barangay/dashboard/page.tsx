import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  rejected: "destructive",
  submitted: "secondary",
  verified: "secondary",
  resolved: "default",
  closed: "default",
  mediation: "secondary",
};

export default async function BarangayDashboard() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, barangays(name)")
    .eq("id", session.user.id)
    .single();

  const barangayData = profile?.barangays as unknown as { name: string } | null;
  const barangayId = barangayData?.name || "";

  const [certResult, complaintResult, reportResult] = await Promise.all([
    supabase
      .from("certification_requests")
      .select("id, status, type, purpose, created_at, requester:profiles(full_name)")
      .eq("barangay_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("complaints")
      .select("id, status, subject, created_at")
      .eq("barangay_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("reports")
      .select("id, status, title, type, created_at")
      .eq("barangay_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const pendingCerts = certResult.data?.filter(c => c.status === "submitted" || c.status === "verified").length || 0;
  const activeComplaints = complaintResult.data?.filter(c => c.status !== "resolved" && c.status !== "closed").length || 0;
  const totalReports = reportResult.data?.length || 0;

  return (
    <div className="space-y-8 animate-stagger-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight">Barangay Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {barangayId ? `${barangayId} — Operations Center` : "Operations Center"}
          </p>
        </div>
        <Button asChild>
          <Link href="/barangay/certifications">
            <Plus /> Process Requests
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-primary text-primary-foreground border-0 shadow-sm">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-inherit opacity-90">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-2xl font-bold font-sans tracking-tight">{pendingCerts} Requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground">
              Active Complaints
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-2xl font-bold font-sans tracking-tight">{activeComplaints} Cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground">
              Reports Submitted
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-2xl font-bold font-sans tracking-tight">{totalReports}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
            <CardTitle className="font-bold text-sm">Recent Certifications</CardTitle>
            <Button variant="link" size="sm" asChild className="text-xs font-bold">
              <Link href="/barangay/certifications">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {!certResult.data || certResult.data.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No certification requests yet.</p>
            ) : (
              <div className="divide-y divide-border/50">
                {certResult.data.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between px-6 py-3 text-xs">
                    <div>
                      <p className="font-bold text-foreground">{cert.type.replace(/_/g, " ")}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{cert.purpose}</p>
                    </div>
                    <Badge variant={statusVariant[cert.status] || "secondary"} className="uppercase text-[10px]">
                      {cert.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
            <CardTitle className="font-bold text-sm">Recent Complaints</CardTitle>
            <Button variant="link" size="sm" asChild className="text-xs font-bold">
              <Link href="/barangay/complaints">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {!complaintResult.data || complaintResult.data.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No complaints yet.</p>
            ) : (
              <div className="divide-y divide-border/50">
                {complaintResult.data.map((complaint) => (
                  <div key={complaint.id} className="flex items-center justify-between px-6 py-3 text-xs">
                    <div>
                      <p className="font-bold text-foreground">{complaint.subject}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(complaint.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={statusVariant[complaint.status] || "secondary"} className="uppercase text-[10px]">
                      {complaint.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
