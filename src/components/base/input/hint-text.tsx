"use client";
import type { ReactNode } from "react";
import { cx } from "@/utils/cx";

export const HintText = ({ children, isInvalid }: { children: ReactNode; isInvalid?: boolean }) => {
    return (
        <p className={cx("text-sm text-quaternary", isInvalid && "text-error-primary")}>
            {children}
        </p>
    );
};
