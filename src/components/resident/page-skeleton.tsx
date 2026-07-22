import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/** Page title + subtitle block used at the top of most resident pages. */
function HeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>
      {withAction && <Skeleton className="h-9 w-32 rounded-lg self-start" />}
    </div>
  );
}

/** A row of icon + two-line text + trailing badge — matches the resident list rows. */
function ListRowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="border border-border rounded-2xl bg-white divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** List page: Certifications, Complaints. */
export function ResidentListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <HeaderSkeleton withAction />
      <ListRowsSkeleton rows={rows} />
    </div>
  );
}

/** Notifications page: header + simple feed. */
export function ResidentFeedSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />
      <div className="border border-border rounded-2xl bg-white divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-4">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-full max-w-md" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Form page: New Request, New Complaint, Profile Settings. */
export function ResidentFormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />
      <Card>
        <CardContent className="pt-6 space-y-5">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-10 w-36 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

/** Detail page: single certification / complaint. */
export function ResidentDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-28" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Skeleton className="h-4 w-36" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/** Resident dashboard: greeting, pill, search, banner, stats, two lists. */
export function ResidentDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Greeting row */}
      <div className="flex items-center justify-end gap-3">
        <div className="space-y-2 flex flex-col items-end">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3.5 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
      </div>

      {/* Location + date pill */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Service search */}
      <Skeleton className="h-11 w-full rounded-xl" />

      {/* Feature banner */}
      <Skeleton className="h-44 w-full rounded-2xl" />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two recent lists */}
      {Array.from({ length: 2 }).map((_, s) => (
        <div key={s}>
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3.5 w-16" />
          </div>
          <div className="border border-border rounded-2xl bg-white divide-y divide-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
