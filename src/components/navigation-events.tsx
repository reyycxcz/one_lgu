"use client"

import NProgress from "nprogress"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, Suspense } from "react"

function NavigationEventsInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const NProgressRef = useRef(false)

  useEffect(() => {
    if (!NProgressRef.current) {
      NProgress.configure({ showSpinner: false, speed: 200 })
      NProgress.start()
      NProgressRef.current = true
    }

    const timer = setTimeout(() => {
      if (NProgressRef.current) {
        NProgress.done()
        NProgressRef.current = false
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (NProgressRef.current) {
        NProgress.done()
        NProgressRef.current = false
      }
    }
  }, [pathname, searchParams])

  return null
}

export function NavigationEvents() {
  return (
    <Suspense fallback={null}>
      <NavigationEventsInner />
    </Suspense>
  )
}