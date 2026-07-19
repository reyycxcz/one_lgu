import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import { Clock, FileText, AlertOctagon, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function NotificationsPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", session.user.id)
    .single();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", profile?.id || session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 animate-stagger-in">
      <div>
        <h1 className="font-sans text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time status updates and official government notices.</p>
      </div>

      <div className="space-y-4">
        {(!notifications || notifications.length === 0) ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notif) => (
            <Card key={notif.id} className={notif.is_read ? "" : "border-primary/30 bg-primary/5"}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                  {notif.type === "certification_update" ? (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  ) : notif.type === "complaint_update" ? (
                    <AlertOctagon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="font-sans font-semibold text-sm text-foreground truncate">{notif.title}</h3>
                      {!notif.is_read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <span className="font-sans text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" /> {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
