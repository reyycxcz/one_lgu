import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface ButtonUtilityProps {
  icon?: LucideIcon;
  tooltip?: string;
  size?: "xs" | "sm" | "md";
  color?: "primary" | "secondary" | "tertiary";
  onClick?: () => void;
  className?: string;
}

const sizeMap = {
  xs: "h-7 w-7",
  sm: "h-8 w-8",
  md: "h-9 w-9",
};

const colorMap = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  tertiary: "text-muted-foreground hover:bg-muted hover:text-foreground",
};

export function ButtonUtility({ icon: Icon, tooltip, size = "sm", color = "tertiary", onClick, className }: ButtonUtilityProps) {
  return (
    <button
      title={tooltip}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md transition-colors",
        sizeMap[size],
        colorMap[color],
        className
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
    </button>
  );
}
