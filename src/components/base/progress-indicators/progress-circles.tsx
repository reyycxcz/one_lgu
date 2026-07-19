"use client";
import { cx } from "@/utils/cx";

export const ProgressBarCircle = ({ value, size = "sm" }: { value: number; size?: string }) => {
    const sizes: Record<string, string> = { xxs: "size-8", xs: "size-10", sm: "size-12", md: "size-16" };
    return (
        <div className={cx("relative", sizes[size] || sizes.sm)}>
            <svg className="size-full -rotate-90">
                <circle cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                <circle
                    cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeWidth="8"
                    className="text-brand"
                    strokeDasharray={`${(value / 100) * 251} 251`}
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};
