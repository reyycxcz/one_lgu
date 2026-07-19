"use client";
import type { PropsWithChildren } from "react";
import { X as CloseIcon, Menu02 } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { useState } from "react";

export const MobileNavigationHeader = ({ children }: PropsWithChildren) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <header className="flex h-14 items-center justify-between border-b border-border bg-white p-3 pl-4 lg:hidden">
                <span className="text-sm font-bold text-primary">ONELGU</span>
                <button onClick={() => setOpen(!open)} className="flex items-center justify-center rounded-lg p-2 text-secondary hover:bg-muted">
                    <Menu02 className="size-6" />
                </button>
            </header>
            {open && (
                <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setOpen(false)}>
                    <div className="h-full w-72 bg-white" onClick={(e) => e.stopPropagation()}>
                        {children}
                    </div>
                </div>
            )}
        </>
    );
};
