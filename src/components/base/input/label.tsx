"use client";
import type { ReactNode } from "react";

export const Label = ({ children, isRequired, isInvalid }: { children: ReactNode; isRequired?: boolean; isInvalid?: boolean }) => {
    return (
        <label className="text-sm font-medium text-secondary">
            {children}
            {isRequired && <span className="text-error-primary ml-0.5">*</span>}
        </label>
    );
};
