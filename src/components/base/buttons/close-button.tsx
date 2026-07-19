"use client";
import { X } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface CloseButtonProps {
    onClick?: () => void;
    size?: "sm" | "md";
    className?: string;
}

export const CloseButton = ({ onClick, size = "sm", className }: CloseButtonProps) => {
    const sizeClasses = size === "sm" ? "size-7" : "size-8";
    return (
        <button
            onClick={onClick}
            className={cx(
                "inline-flex items-center justify-center rounded-md text-quaternary hover:text-secondary hover:bg-muted transition-colors",
                sizeClasses,
                className
            )}
        >
            <X className="size-4" />
        </button>
    );
};
