"use client";
import { cx } from "@/utils/cx";

export const ProgressBar = ({ value, className }: { value: number; className?: string }) => {
    return (
        <div className={cx("h-2 w-full rounded-full bg-muted", className)}>
            <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${value}%` }}
            />
        </div>
    );
};
