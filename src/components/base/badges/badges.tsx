import { cn } from "@/lib/utils";

export type BadgeColor = "gray" | "success" | "warning" | "error" | "info" | "primary";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  size?: "sm" | "md";
  className?: string;
}

const colorMap: Record<BadgeColor, string> = {
  gray: "bg-gray-100 text-gray-700 border-gray-200",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  primary: "bg-primary/10 text-primary border-primary/20",
};

const sizeMap = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
};

export function Badge({ children, color = "gray", size = "sm", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full font-medium border", colorMap[color], sizeMap[size], className)}>
      {children}
    </span>
  );
}

interface BadgeWithDotProps extends BadgeProps {
  dot?: boolean;
}

export function BadgeWithDot({ children, color = "gray", size = "sm", dot = true, className }: BadgeWithDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full font-medium border", colorMap[color], sizeMap[size], className)}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", {
        "bg-gray-500": color === "gray",
        "bg-green-500": color === "success",
        "bg-amber-500": color === "warning",
        "bg-red-500": color === "error",
        "bg-blue-500": color === "info",
        "bg-primary": color === "primary",
      })} />}
      {children}
    </span>
  );
}
