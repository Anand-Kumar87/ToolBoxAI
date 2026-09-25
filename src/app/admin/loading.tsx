export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 lg:p-8 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-9 w-72 rounded-2xl bg-muted/60 animate-pulse" />
        <div className="h-4 w-96 rounded-xl bg-muted/40 animate-pulse" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="h-11 w-96 rounded-2xl bg-muted/50 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-32 rounded-xl bg-muted/40 animate-pulse" />
          <div className="h-9 w-28 rounded-xl bg-muted/40 animate-pulse" />
        </div>
      </div>

      {/* 5 KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-card/40 p-6 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-muted/60 animate-pulse" />
              <div className="h-8 w-8 rounded-xl bg-muted/60 animate-pulse" />
            </div>
            <div className="h-8 w-24 rounded-lg bg-muted/80 animate-pulse" />
            <div className="h-3 w-28 rounded bg-muted/40 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Chart & Distribution Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card/40 p-6 space-y-4 shadow-sm">
          <div className="h-5 w-48 rounded bg-muted/60 animate-pulse" />
          <div className="h-44 w-full rounded-xl bg-muted/30 animate-pulse" />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 space-y-4 shadow-sm">
          <div className="h-5 w-36 rounded bg-muted/60 animate-pulse" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-muted/30 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
