"use client";
import type { ReactNode } from "react";
import { SearchLg } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { cx } from "@/utils/cx";
import { MobileNavigationHeader } from "../base-components/mobile-header";
import { NavAccountCard } from "../base-components/nav-account-card";
import { NavList } from "../base-components/nav-list";
import type { NavItemType } from "../config";

interface SidebarNavigationProps {
    activeUrl?: string;
    items: NavItemType[];
    footerItems?: NavItemType[];
    featureCard?: ReactNode;
    showAccountCard?: boolean;
    hideBorder?: boolean;
    className?: string;
    avatarRounded?: boolean;
}

export const SidebarNavigationSimple = ({
    activeUrl,
    items,
    footerItems = [],
    featureCard,
    showAccountCard = true,
    hideBorder = false,
    className,
}: SidebarNavigationProps) => {
    const MAIN_SIDEBAR_WIDTH = 280;

    const content = (
        <aside
            style={{ "--width": `${MAIN_SIDEBAR_WIDTH}px` } as React.CSSProperties}
            className={cx(
                "flex h-full w-full max-w-full flex-col justify-between overflow-auto bg-white pt-4 lg:w-(--width) lg:pt-5",
                !hideBorder && "border-secondary md:border-r",
                className,
            )}
        >
            <div className="flex flex-col gap-5 px-4 lg:px-5">
                <UntitledLogo className="h-6" />
                <Input size="md" aria-label="Search" placeholder="Search" icon={SearchLg} className="md:hidden" />
                <Input shortcut size="sm" aria-label="Search" placeholder="Search" icon={SearchLg} className="max-md:hidden" />
            </div>
            <NavList activeUrl={activeUrl} items={items} />
            <div className="mt-auto flex flex-col gap-3 px-4 py-4 lg:py-5">
                {footerItems.length > 0 && (
                    <ul className="flex flex-col">
                        {footerItems.map((item) => (
                            <li key={item.label} className="py-px">
                                <a
                                    href={item.href}
                                    className="group flex w-full items-center gap-2 rounded-md p-2 text-sm font-semibold text-secondary hover:bg-muted transition-colors"
                                >
                                    {item.icon && <item.icon className="size-5 text-quaternary" />}
                                    <span className="flex-1 truncate">{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                )}
                {featureCard}
                {showAccountCard && <NavAccountCard />}
            </div>
        </aside>
    );

    return (
        <>
            <MobileNavigationHeader>{content}</MobileNavigationHeader>
            <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex">{content}</div>
            <div
                style={{ paddingLeft: MAIN_SIDEBAR_WIDTH }}
                className="invisible hidden lg:sticky lg:top-0 lg:bottom-0 lg:left-0 lg:block"
            />
        </>
    );
};
