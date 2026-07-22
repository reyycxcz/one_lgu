import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const WIDTHS = ["w-32", "w-24", "w-28", "w-20", "w-24", "w-16"];

function HeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      {withAction && <Skeleton className="h-9 w-32 rounded-lg self-start" />}
    </div>
  );
}

/** Table-shaped barangay page: Certifications, Complaints, Staff. */
export function BarangayTableSkeleton({ columns = 5, rows = 6 }: { columns?: number; rows?: number }) {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-6 px-4 h-12 border-b border-border">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton
                key={i}
                className={`h-3.5 ${WIDTHS[i % WIDTHS.length]} ${i === columns - 1 ? "ml-auto" : ""}`}
              />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="flex items-center gap-6 px-4 h-14 border-b border-border last:border-0">
              {Array.from({ length: columns }).map((_, i) =>
                i === columns - 1 ? (
                  <Skeleton key={i} className="h-5 w-20 rounded-full ml-auto" />
                ) : (
                  <Skeleton key={i} className={`h-3.5 ${WIDTHS[i % WIDTHS.length]}`} />
                )
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/** Card-grid page: Dashboard, Compliance. */
export function BarangayStatsSkeleton({ cards = 4, withList = true }: { cards?: number; withList?: boolean }) {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: cards }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      {withList && (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** List-of-cards page: Documents, Reports. */
export function BarangayListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-8">
      <HeaderSkeleton withAction />
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-full shrink-0" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/** Form page: Submit Report, Profile. */
export function BarangayFormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />
      <Card className="max-w-2xl">
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

/** Detail page: single certification / complaint / report / document. */
export function BarangayDetailSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-28" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
