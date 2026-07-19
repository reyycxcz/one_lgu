"use client";
import type { ReactNode } from "react";

export const Tooltip = ({ children, title, placement }: { children: ReactNode; title: string; placement?: string }) => {
    return <div title={title}>{children}</div>;
};

export const TooltipTrigger = ({ children, className }: { children: ReactNode; className?: string }) => {
    return <div className={className}>{children}</div>;
};
