import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { LguEmptyState } from "@/components/lgu/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Clock } from "lucide-react";

export default async function RecentActivitiesPage() {
  const supabase = await createClient();

  const { data: activities } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, created_at, profiles!audit_logs_actor_id_fkey(full_name), barangays(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Recent Activities"
        description="Latest actions taken across the system."
      />
      <Card>
        <CardContent className={activities && activities.length > 0 ? "p-0 divide-y divide-border" : ""}>
          {!activities || activities.length === 0 ? (
            <LguEmptyState icon={<Activity />} message="No recorded activity yet." />
          ) : (
            activities.map((a) => {
              const actor = a.profiles as unknown as { full_name: string } | null;
              const barangay = a.barangays as unknown as { name: string } | null;
              return (
                <div key={a.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{actor?.full_name || "System"}</span>{" "}
                      <span className="text-muted-foreground">{a.action.replace(/\./g, " ").replace(/_/g, " ")}</span>
                      {barangay?.name && <span className="text-muted-foreground"> · {barangay.name}</span>}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-foreground/45 mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(a.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
