import { LGUSectionCards } from "@/components/lgu-section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ChartBarMixed } from "@/components/chart-bar-mixed"
import { ChartPieLabel } from "@/components/chart-pie-label"
import { ChartRadarDots } from "@/components/chart-radar-dots"

export default function LguAnalyticsPage() {
  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
              <p className="text-muted-foreground">Cross-module insights across all barangays</p>
            </div>
            <LGUSectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
              <ChartBarMixed />
              <ChartPieLabel />
            </div>
            <div className="px-4 lg:px-6">
              <ChartRadarDots />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
