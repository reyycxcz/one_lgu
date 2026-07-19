"use client";
import { cx } from "@/utils/cx";

export const RadioButtonBase = ({ isSelected, className }: { isSelected?: boolean; className?: string }) => {
    return (
        <div className={cx(
            "size-4 rounded-full border-2 flex items-center justify-center",
            isSelected ? "border-brand" : "border-border",
            className
        )}>
            {isSelected && <div className="size-2 rounded-full bg-brand" />}
        </div>
    );
};
