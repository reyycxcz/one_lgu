import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ src, alt, size = "md", className }: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("rounded-full object-cover border border-border", sizes[size], className)}
    />
  );
}
