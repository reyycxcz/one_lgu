"use client";
import { cx } from "@/utils/cx";

interface AvatarLabelGroupProps {
    src?: string;
    title: string;
    subtitle?: string;
    status?: "online" | "offline";
    size?: "sm" | "md" | "lg";
    rounded?: boolean;
}

export const AvatarLabelGroup = ({ src, title, subtitle, status, size = "md", rounded }: AvatarLabelGroupProps) => {
    const sizes: Record<string, string> = { sm: "size-8", md: "size-10", lg: "size-12" };
    return (
        <div className="flex items-center gap-3">
            <div className="relative">
                <img
                    src={src || `https://api.dicebear.com/10.x/initials/svg?seed=${title}`}
                    alt={title}
                    className={cx(sizes[size], rounded ? "rounded-full" : "rounded-lg", "object-cover bg-muted")}
                />
                {status && (
                    <span className={cx(
                        "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white",
                        status === "online" ? "bg-green-500" : "bg-gray-400"
                    )} />
                )}
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-primary truncate">{title}</p>
                {subtitle && <p className="text-xs text-quaternary truncate">{subtitle}</p>}
            </div>
        </div>
    );
};
