import { Building2, AlertTriangle, FileCheck2, TrendingUp } from "lucide-react"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

export async function LGUSectionCards() {
  const supabase = await createClient()

  const [
    { count: barangaysCount },
    { count: pendingReports },
    { count: pendingCerts },
    { count: pendingComplaints },
    { count: approvedReports },
    { count: totalReports },
  ] = await Promise.all([
    supabase.from("barangays").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("reports").select("*", { count: "exact", head: true }).in("status", ["submitted", "under_review"]),
    supabase.from("certification_requests").select("*", { count: "exact", head: true }).in("status", ["submitted", "verified"]),
    supabase.from("complaints").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("reports").select("*", { count: "exact", head: true }),
  ])

  const pendingTotal = (pendingReports || 0) + (pendingCerts || 0) + (pendingComplaints || 0)
  const complianceRate = totalReports && totalReports > 0 ? Math.round(((approvedReports || 0) / totalReports) * 1000) / 10 : 0

  return (
    <div className="*:data-[slot=card]:shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Total Barangays</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {barangaysCount || 0}
          </CardTitle>
          <div className="absolute right-4 top-4 text-muted-foreground">
            <Building2 className="size-4" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">All barangays registered</div>
          <div className="text-muted-foreground">Active in the system</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Pending Submissions</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {pendingTotal}
          </CardTitle>
          <div className="absolute right-4 top-4 text-muted-foreground">
            <AlertTriangle className="size-4" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Needs review</div>
          <div className="text-muted-foreground">Reports, certifications & complaints awaiting action</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Approved Reports</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {approvedReports || 0}
          </CardTitle>
          <div className="absolute right-4 top-4 text-muted-foreground">
            <FileCheck2 className="size-4" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Reports approved</div>
          <div className="text-muted-foreground">Out of {totalReports || 0} total reports submitted</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Compliance Rate</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {complianceRate}%
          </CardTitle>
          <div className="absolute right-4 top-4 text-muted-foreground">
            <TrendingUp className="size-4" />
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Report approval rate</div>
          <div className="text-muted-foreground">Overall barangay compliance</div>
        </CardFooter>
      </Card>
    </div>
  )
}
