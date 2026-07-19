"use client";
import type { HTMLAttributes } from "react";

export const UntitledLogoMinimal = (props: HTMLAttributes<HTMLOrSVGElement>) => {
    return (
        <svg viewBox="0 0 16 16" fill="none" {...props}>
            <path d="M8 2L14 14H2L8 2Z" fill="currentColor"/>
        </svg>
    );
};
