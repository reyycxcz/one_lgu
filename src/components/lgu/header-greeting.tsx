"use client";

import { useState, useEffect } from "react";

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HeaderGreeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    setGreeting(greetingFor(new Date().getHours()));
  }, []);

  // First name only, keeps it compact.
  const firstName = name ? name.split(" ")[0] : "";

  if (!greeting) return null;

  return (
    <p className="text-sm font-semibold text-foreground hidden lg:block">
      {greeting}, <span className="text-primary">{firstName}</span> 👋
    </p>
  );
}
