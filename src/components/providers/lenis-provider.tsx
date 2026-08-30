"use client";

import { ReactLenis } from "lenis/react";
import { ReactNode, useEffect, useState } from "react";

// Lenis's virtual/interpolated scroll is a desktop-wheel enhancement — on
// touch devices it can desync from native touch scrolling in a way that
// leaves framer-motion's `whileInView` IntersectionObserver never firing,
// so scroll-reveal sections stay stuck at their hidden (opacity: 0) state
// forever. Skip the wrapper entirely on coarse-pointer (touch) devices and
// let native scrolling — which whileInView is built to work with — take
// over; desktop keeps the smooth-scroll feel.
export function LenisProvider({ children }: { children: ReactNode }) {
  const [skipLenis, setSkipLenis] = useState(false);

  useEffect(() => {
    setSkipLenis(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  if (skipLenis) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
