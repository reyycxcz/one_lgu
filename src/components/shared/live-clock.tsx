"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  const date = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-muted/60 text-xs font-medium text-foreground/70">
      <Clock className="size-3.5 text-muted-foreground/60" />
      <span>{date}</span>
      <span className="text-muted-foreground/40">·</span>
      <span className="tabular-nums">{time}</span>
    </div>
  );
}
