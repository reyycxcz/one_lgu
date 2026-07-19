"use client";
import type { HTMLAttributes } from "react";
import { cx } from "@/utils/cx";

export const UntitledLogo = (props: HTMLAttributes<HTMLOrSVGElement>) => {
    return (
        <div {...props} className={cx("flex h-8 w-max items-center justify-start overflow-visible", props.className)}>
            <div className="flex aspect-square h-full w-auto shrink-0 items-center justify-center rounded-lg bg-[#107A43]">
                <svg viewBox="0 0 16 16" fill="none" className="size-4">
                    <path d="M8 2L14 14H2L8 2Z" fill="white"/>
                </svg>
            </div>
            <div className="aspect-[0.3] h-full" />
            <span className="text-sm font-bold text-primary">ONELGU</span>
        </div>
    );
};
