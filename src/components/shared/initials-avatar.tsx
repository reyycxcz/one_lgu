import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "#0B5A30", "#20AD66", "#0F766E", "#0369A1", "#7C3AED", "#BE185D", "#B45309",
];

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function InitialsAvatar({
  name,
  size = 36,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = initialsFromName(name || "?");
  const bg = colorFromName(name || "?");
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full flex-shrink-0 font-bold text-white select-none",
        className
      )}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
