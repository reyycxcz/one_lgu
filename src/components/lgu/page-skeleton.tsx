import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const WIDTHS = ["w-32", "w-24", "w-28", "w-20", "w-24", "w-16", "w-20"];

/** Generic page header skeleton: title + description bar. Reused by every variant below. */
function HeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="h-4 w-80" />
    </div>
  );
}

/** Table-shaped page: matches pages built on FilterableTable/PaginatedTable. */
export function LguPageSkeleton({ columns = 5, rows = 6 }: { columns?: number; rows?: number }) {
  return (
    <div className="space-y-6">
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
          {Array.from({ length: rows }).map((_, row) => (
            <div key={row} className="flex items-center gap-6 px-4 h-14 border-b border-border last:border-0">
              {Array.from({ length: columns }).map((_, i) => {
                const isLast = i === columns - 1;
                return isLast ? (
                  <Skeleton key={i} className="h-5 w-16 rounded-full ml-auto" />
                ) : (
                  <Skeleton key={i} className={`h-3.5 ${WIDTHS[i % WIDTHS.length]}`} />
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/** Stat-card grid page: matches pages built from a row of Card stat tiles (e.g. Submission Summary, System Settings). */
export function LguStatsSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-${Math.min(cards, 4)}`}>
        {Array.from({ length: cards }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** Activity feed page: matches pages built as a vertical list of icon + text rows (e.g. Recent Activities). */
export function LguActivityListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-64" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/** Chart page: matches pages built from one or more chart Cards (e.g. Analytics pages). */
export function LguChartSkeleton({ charts = 1 }: { charts?: number }) {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <div className={charts > 1 ? "grid gap-4 lg:grid-cols-2" : ""}>
        {Array.from({ length: charts }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** Form page: matches pages built from a single card containing a form (e.g. Profile, Change Password). */
export function LguFormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      <HeaderSkeleton />
      <Card>
        <CardContent className="pt-6 max-w-xl space-y-5">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}
