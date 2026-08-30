"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Sidebar, type NavGroup } from "./sidebar";

// The hamburger ("3 lines") button + slide-out drawer used on every portal's
// mobile header. Reuses the exact same <Sidebar> the desktop layout renders
// — same groups, same links, same active/logout behavior — so mobile never
// drifts out of sync with desktop nav, and every possible destination stays
// reachable once a screen drops below the sidebar breakpoint.
export function MobileNavTrigger({
  navGroups,
  user,
  appSubtitle,
  onLogout,
}: {
  navGroups: NavGroup[];
  user?: { name?: string; role?: string; email?: string };
  appSubtitle?: string;
  onLogout?: () => void;
}) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the drawer is open, same as ConfirmDialog.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex items-center justify-center h-9 w-9 rounded-lg border border-border text-foreground/70 hover:bg-muted/50 transition-colors md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-[100] md:hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setOpen(false)}
                />
                <motion.div
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-y-0 left-0 shadow-2xl"
                >
                  <Sidebar
                    navGroups={navGroups}
                    user={user}
                    appSubtitle={appSubtitle}
                    onLogout={onLogout}
                    onNavigate={() => setOpen(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="absolute top-4 right-3 h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-foreground/70 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
