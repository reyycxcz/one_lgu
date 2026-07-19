"use client";
import { useState, useEffect } from "react";

function getMediaQuery(breakpoint: "sm" | "md" | "lg" | "xl") {
    const width = breakpoint === "lg" ? "1024px" : breakpoint === "md" ? "768px" : "640px";
    return `(min-width: ${width})`;
}

export function useBreakpoint(breakpoint: "sm" | "md" | "lg" | "xl") {
    const [matches, setMatches] = useState(
        () => typeof window !== "undefined" && window.matchMedia(getMediaQuery(breakpoint)).matches
    );
    useEffect(() => {
        const mq = window.matchMedia(getMediaQuery(breakpoint));
        // eslint-disable-next-line react-hooks/set-state-in-effect -- resync when `breakpoint` prop changes after mount
        setMatches(mq.matches);
        const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [breakpoint]);
    return matches;
}
