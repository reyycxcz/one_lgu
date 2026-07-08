import { Clock, FileText, AlertOctagon } from "lucide-react";

const MOCK_NOTIFS = [
  {
    id: 1,
    title: "Document Verified",
    message: "Your Barangay Clearance request (CERT-9081) has been verified. Approvals pending generated documents.",
    type: "certification_update",
    time: "2 hours ago",
    isRead: false,
  },
  {
    id: 2,
    title: "Mediation Scheduled",
    message: "A Lupon mediation hearing has been scheduled for case CASE-4402 on Jul 12, 10:00 AM.",
    type: "complaint_update",
    time: "4 days ago",
    isRead: true,
  },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <span className="micro-label">04 — SYSTEM ALERTS</span>
        <h1 className="font-pixel text-4xl uppercase tracking-wider mt-1">My Notifications</h1>
        <p className="text-sm text-foreground/60 mt-1">Real-time status updates and official government notices.</p>
      </div>

      {/* Notifications Inbox */}
      <div className="space-y-4">
        {MOCK_NOTIFS.map((notif) => (
          <div
            key={notif.id}
            className={`bryl-card p-5 flex items-start gap-4 transition-all ${
              notif.isRead ? "bg-white" : "bg-primary/5 border-primary/40"
            }`}
          >
            <div className="h-9 w-9 rounded-lg bg-white border border-border flex items-center justify-center shrink-0">
              {notif.type === "certification_update" ? (
                <FileText className="h-4.5 w-4.5 text-foreground/75" />
              ) : (
                <AlertOctagon className="h-4.5 w-4.5 text-foreground/75" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <h3 className="font-sans font-semibold text-sm text-foreground">{notif.title}</h3>
                  {!notif.isRead && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </div>
                <span className="font-mono text-[9px] text-foreground/45 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {notif.time}
                </span>
              </div>
              <p className="text-xs text-foreground/70 leading-relaxed">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
