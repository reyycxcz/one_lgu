"use client";
import type { FC, ReactNode } from "react";
import React, { isValidElement } from "react";
import { cx, sortCx } from "@/utils/cx";

const styles = sortCx({
    common: {
        root: "group relative inline-flex h-max cursor-pointer items-center justify-center whitespace-nowrap outline-brand transition duration-100 ease-linear disabled:cursor-not-allowed disabled:opacity-50",
        icon: "pointer-events-none size-5 shrink-0 transition-inherit-all",
    },
    sizes: {
        xs: { root: "gap-1 rounded-lg px-2.5 py-1.5 text-sm font-semibold" },
        sm: { root: "gap-1 rounded-lg px-3 py-2 text-sm font-semibold" },
        md: { root: "gap-1 rounded-lg px-3.5 py-2.5 text-sm font-semibold" },
        lg: { root: "gap-1.5 rounded-lg px-4 py-2.5 text-md font-semibold" },
        xl: { root: "gap-1.5 rounded-lg px-4.5 py-3 text-md font-semibold" },
    },
    colors: {
        primary: { root: "bg-brand text-white shadow-xs ring-1 ring-transparent hover:bg-brand/90" },
        secondary: { root: "bg-white text-secondary shadow-xs ring-1 ring-inset ring-border hover:bg-muted" },
        tertiary: { root: "text-tertiary hover:bg-muted hover:text-tertiary" },
        "link-color": { root: "justify-normal rounded p-0! text-brand hover:text-brand/80" },
        "link-gray": { root: "justify-normal rounded p-0! text-tertiary hover:text-tertiary" },
    },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    size?: keyof typeof styles.sizes;
    color?: keyof typeof styles.colors;
    iconLeading?: ReactNode;
    iconTrailing?: ReactNode;
    isLoading?: boolean;
}

function renderIcon(icon: ReactNode) {
    if (isValidElement(icon)) return icon;
    if (typeof icon === "function") {
        const Icon = icon as FC<{ className?: string }>;
        return <Icon className={styles.common.icon} />;
    }
    return null;
}

export const Button = ({
    size = "sm",
    color = "primary",
    children,
    className,
    iconLeading: IconLeading,
    iconTrailing: IconTrailing,
    isLoading,
    ...props
}: ButtonProps) => {
    return (
        <button
            className={cx(styles.common.root, styles.sizes[size].root, styles.colors[color].root, className)}
            {...props}
        >
            {renderIcon(IconLeading)}
            {children && <span>{children}</span>}
            {renderIcon(IconTrailing)}
        </button>
    );
};
