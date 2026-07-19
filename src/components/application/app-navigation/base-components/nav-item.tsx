"use client";
import type { FC, HTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { ChevronDown, Share04 } from "@untitledui/icons";
import { cx, sortCx } from "@/utils/cx";

const styles = sortCx({
    root: "group relative flex max-h-9 w-full cursor-pointer items-center rounded-md bg-primary outline-none transition duration-100 ease-linear select-none hover:bg-muted focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2",
    rootSelected: "bg-secondary hover:bg-secondary",
});

interface NavItemBaseProps {
    iconOnly?: boolean;
    open?: boolean;
    href?: string;
    type: "link" | "collapsible" | "collapsible-child";
    icon?: FC<HTMLAttributes<HTMLOrSVGElement>>;
    badge?: ReactNode;
    current?: boolean;
    truncate?: boolean;
    onClick?: MouseEventHandler;
    children?: ReactNode;
}

export const NavItemBase = ({ current, type, badge, href, icon: Icon, children, truncate = true, onClick }: NavItemBaseProps) => {
    const iconElement = Icon && (
        <Icon
            aria-hidden="true"
            className={cx(
                "mr-2 size-5 shrink-0 text-quaternary transition-inherit-all group-hover/item:text-tertiary",
                current && "text-tertiary",
            )}
        />
    );

    const labelElement = (
        <span
            className={cx(
                "flex-1 text-sm font-semibold text-secondary transition-inherit-all group-hover/item:text-foreground",
                truncate && "truncate",
                current && "text-foreground",
            )}
        >
            {children}
        </span>
    );

    if (type === "collapsible") {
        return (
            <summary className={cx("p-2", styles.root, current && styles.rootSelected)} onClick={onClick}>
                {iconElement}
                {labelElement}
                {badge && <span className="ml-3 text-xs text-quaternary">{badge}</span>}
                <ChevronDown aria-hidden="true" className="ml-3 size-4 shrink-0 stroke-[2.5px] text-quaternary in-open:-scale-y-100" />
            </summary>
        );
    }

    if (type === "collapsible-child") {
        return (
            <a
                href={href}
                className={cx("py-2 pr-3 pl-10", styles.root, current && styles.rootSelected)}
                onClick={onClick}
                aria-current={current ? "page" : undefined}
            >
                {labelElement}
            </a>
        );
    }

    return (
        <a
            href={href}
            className={cx("group/item p-2", styles.root, current && styles.rootSelected)}
            onClick={onClick}
            aria-current={current ? "page" : undefined}
        >
            {iconElement}
            {labelElement}
            {badge && <span className="ml-3 text-xs text-quaternary">{badge}</span>}
        </a>
    );
};
