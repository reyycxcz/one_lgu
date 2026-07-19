import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import { FileText, AlertOctagon, Clock, ChevronRight, MapPin, Bell, User, FilePlus2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ServiceSearch from "./service-search";

export default async function ResidentDashboard() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, barangays(name)")
    .eq("id", session.user.id)
    .single();

  const { data: certifications } = await supabase
    .from("certification_requests")
    .select("id, type, status, created_at")
    .eq("requester_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: complaints } = await supabase
    .from("complaints")
    .select("id, subject, status, created_at")
    .eq("complainant_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const firstName = profile?.full_name?.split(" ")[0] || "Resident";
  const barangayName = (profile?.barangays as any)?.name || session.user.user_metadata?.barangay_code || "your barangay";
  const pendingCerts = certifications?.filter(c => c.status === "submitted" || c.status === "verified").length || 0;
  const activeComplaints = complaints?.filter(c => c.status !== "resolved" && c.status !== "closed").length || 0;

  const certTypeLabels: Record<string, string> = {
    barangay_clearance: "Clearance",
    certificate_of_residency: "Residency",
    certificate_of_indigency: "Indigency",
    business_clearance: "Business",
    first_time_job_seeker: "Job Seeker",
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  const shortcuts = [
    { label: "Certificates", href: "/resident/certifications", icon: FileText },
    { label: "Complaints", href: "/resident/complaints", icon: AlertOctagon },
    { label: "Alerts", href: "/resident/notifications", icon: Bell },
    { label: "Profile", href: "/resident/profile", icon: User },
  ];

  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Greeting row — eGovPH style: text right-aligned beside avatar */}
      <div className="flex items-center justify-end gap-3">
        <div className="text-right">
          <p className="font-display font-bold text-xl md:text-3xl text-primary leading-tight">Mabuhay, {firstName}</p>
          <p className="text-xs md:text-sm text-foreground/50 leading-tight mt-0.5">Welcome to OneLGU</p>
        </div>
        <img
          src={`https://api.dicebear.com/10.x/open-peeps/svg?seed=${encodeURIComponent(profile?.full_name || "Resident")}`}
          alt="Avatar"
          className="h-11 w-11 md:h-12 md:w-12 rounded-full border border-border bg-white"
        />
      </div>

      {/* Location + date pill */}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-4 py-3 text-sm text-foreground/70">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate font-medium">{barangayName}</span>
        </div>
        <span className="shrink-0 text-foreground/60">{today}</span>
      </div>

      {/* Service search */}
      <ServiceSearch />

      {/* Icon shortcuts */}
      <div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Link href="/resident/certifications/new" className="flex w-16 shrink-0 flex-col items-center gap-1.5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary shadow-[0_4px_14px_-4px_rgba(0,177,94,0.55)]">
            <FilePlus2 className="h-5.5 w-5.5 text-white" />
          </div>
          <span className="text-[11px] font-medium text-foreground/70 text-center">Request</span>
        </Link>
        {shortcuts.map((s) => (
          <Link key={s.href} href={s.href} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white border border-[#E3F2E7] shadow-sm">
              <s.icon className="h-5.5 w-5.5 text-primary" />
            </div>
            <span className="text-[11px] font-medium text-foreground/70 text-center">{s.label}</span>
          </Link>
        ))}
      </div>

      {/* Feature banner */}
      <div className="gradient-primary gradient-shine rounded-2xl p-5 text-white">
        <p className="text-[11px] uppercase tracking-wider text-white/80 font-bold">Barangay Services</p>
        <h2 className="font-display font-bold text-lg mt-1">Request certificates online</h2>
        <p className="text-sm text-white/85 mt-0.5">Clearance, residency, indigency and more — processed by {barangayName}.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm" className="bg-white text-primary hover:bg-white/90 font-bold text-xs">
            <Link href="/resident/certifications/new">Request Certificate</Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="text-white hover:bg-white/15 hover:text-white text-xs font-bold border border-white/30">
            <Link href="/resident/complaints/new">File Complaint</Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats - minimal */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-sans text-foreground/50 uppercase tracking-wider">Certificates</p>
            <p className="text-2xl font-numbers font-bold text-foreground mt-1">{pendingCerts} <span className="text-sm font-normal font-sans text-foreground/50">pending</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-sans text-foreground/50 uppercase tracking-wider">Complaints</p>
            <p className="text-2xl font-numbers font-bold text-foreground mt-1">{activeComplaints} <span className="text-sm font-normal font-sans text-foreground/50">active</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-sans text-foreground/50 uppercase tracking-wider">Barangay</p>
            <p className="text-2xl font-sans font-bold text-foreground mt-1">Open</p>
          </CardContent>
        </Card>
      </div>

      {/* Certifications */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">Recent Certifications</h2>
          <Link href="/resident/certifications" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <Card><CardContent className="p-0 divide-y divide-border">
          {certifications && certifications.length > 0 ? (
            certifications.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{certTypeLabels[cert.type] || cert.type.replace(/_/g, " ")}</p>
                    <div className="flex items-center gap-1.5 text-xs text-foreground/45 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(cert.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={
                  cert.status === "submitted" ? "secondary" :
                  cert.status === "verified" ? "secondary" :
                  cert.status === "approved" ? "default" :
                  cert.status === "rejected" ? "destructive" :
                  "outline"
                } className="text-[11px] capitalize">
                  {cert.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-foreground/50">No certifications yet.</p>
            </div>
          )}
        </CardContent></Card>
      </div>

      {/* Complaints */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-sans text-sm font-bold text-foreground uppercase tracking-wider">Recent Complaints</h2>
          <Link href="/resident/complaints" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <Card><CardContent className="p-0 divide-y divide-border">
          {complaints && complaints.length > 0 ? (
            complaints.map((complaint) => (
              <div key={complaint.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <AlertOctagon className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{complaint.subject}</p>
                    <div className="flex items-center gap-1.5 text-xs text-foreground/45 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(complaint.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={
                  complaint.status === "submitted" ? "secondary" :
                  complaint.status === "under_review" ? "secondary" :
                  complaint.status === "resolved" ? "default" :
                  "outline"
                } className="text-[11px] capitalize">
                  {complaint.status.replace(/_/g, " ")}
                </Badge>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-foreground/50">No complaints filed.</p>
            </div>
          )}
        </CardContent></Card>
      </div>
    </div>
  );
}
