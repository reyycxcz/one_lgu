import { ChartAreaInteractive } from "@/components/chart-area-interactive"

export default function SubmissionAnalyticsPage() {
  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <h2 className="text-2xl font-bold tracking-tight">Submission Analytics</h2>
              <p className="text-muted-foreground">Track document submissions across all barangays</p>
            </div>
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
