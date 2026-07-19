"use client";
import { type ComponentType, type HTMLAttributes } from "react";
import { cx } from "@/utils/cx";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    icon?: ComponentType<HTMLAttributes<HTMLOrSVGElement>>;
    shortcut?: boolean | string;
    size?: "sm" | "md" | "lg";
    isInvalid?: boolean;
    isDisabled?: boolean;
}

export const Input = ({ icon: Icon, shortcut, size = "md", className, isInvalid, isDisabled, ...props }: InputProps) => {
    const sizes = { sm: "h-8 text-xs pl-8", md: "h-10 text-sm pl-10", lg: "h-11 text-md pl-10.5" };
    return (
        <div className={cx("relative flex items-center", className)}>
            {Icon && <Icon className="absolute left-3 size-4 text-quaternary pointer-events-none" />}
            <input
                className={cx(
                    "w-full rounded-lg bg-white px-3 py-2 text-primary ring-1 ring-inset ring-border placeholder:text-quaternary focus:ring-2 focus:ring-brand outline-none transition-shadow",
                    Icon && sizes[size],
                    !Icon && "px-3 py-2 text-sm",
                    isDisabled && "opacity-50 cursor-not-allowed",
                    isInvalid && "ring-error"
                )}
                disabled={isDisabled}
                {...props}
            />
            {shortcut && (
                <div className="absolute right-2 hidden items-center md:flex pointer-events-none">
                    <span className="rounded px-1 py-px text-xs font-medium text-quaternary ring-1 ring-inset ring-border">
                        {typeof shortcut === "string" ? shortcut : "⌘K"}
                    </span>
                </div>
            )}
        </div>
    );
};
