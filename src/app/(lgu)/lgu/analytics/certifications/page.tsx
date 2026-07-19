import { ChartPieLabel } from "@/components/chart-pie-label"

export default function CertificationAnalyticsPage() {
  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <h2 className="text-2xl font-bold tracking-tight">Certification Analytics</h2>
              <p className="text-muted-foreground">View certification request distribution and status</p>
            </div>
            <div className="px-4 lg:px-6">
              <ChartPieLabel />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
