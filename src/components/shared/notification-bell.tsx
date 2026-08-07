"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Clock, FileText, AlertOctagon, Megaphone, X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  // Hides the unread dot once the panel has been opened this session, without
  // stripping the per-item highlight while the user is still reading them.
  const [dismissedDot, setDismissedDot] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Poll for new notifications so the unread dot stays current without a refresh.
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
        // A newly-arrived unread item should bring the dot back.
        if (data.some((n: Notification) => !n.is_read)) {
          setDismissedDot(false);
        }
      }
    } catch {
      // silent
    }
    setLoading(false);
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifications", { method: "POST" });
    } catch {
      // silent
    }
  }

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      fetchNotifications();
      setDismissedDot(true); // clear the dot immediately on open
      markAllRead(); // persist read state server-side (highlights stay until next fetch)
    }
  }

  const hasUnread = !dismissedDot && notifications.some((n) => !n.is_read);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleOpen}
        aria-label={hasUnread ? "Notifications (unread)" : "Notifications"}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative p-2 hover:bg-muted/40 rounded-lg transition-colors"
      >
        <Bell className="h-4.5 w-4.5 text-foreground/60" />
        {hasUnread && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
        )}
      </button>

      {/* Announces new unread notifications to screen readers without an
          intrusive visible alert — the visible dot already covers sighted users. */}
      <span className="sr-only" role="status" aria-live="polite">
        {hasUnread ? "You have unread notifications" : ""}
      </span>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-80 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden origin-top-right"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-sans text-sm font-bold text-foreground">Notifications</h3>
              <button onClick={() => setOpen(false)} className="text-foreground/40 hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-xs text-foreground/40">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-foreground/40">No notifications</div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-border/50 last:border-0 ${
                      notif.is_read ? "bg-white" : "bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-lg bg-white border border-border flex items-center justify-center shrink-0 mt-0.5">
                        {notif.type === "certification_update" ? (
                          <FileText className="h-3.5 w-3.5 text-foreground/60" />
                        ) : notif.type === "complaint_update" ? (
                          <AlertOctagon className="h-3.5 w-3.5 text-foreground/60" />
                        ) : notif.type === "announcement" ? (
                          <Megaphone className="h-3.5 w-3.5 text-foreground/60" />
                        ) : (
                          <Bell className="h-3.5 w-3.5 text-foreground/60" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-foreground truncate">{notif.title}</p>
                          {!notif.is_read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-[11px] text-foreground/60 leading-relaxed mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[9px] text-foreground/55 mt-1 font-sans">{new Date(notif.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
