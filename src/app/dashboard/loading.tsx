export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-9 w-64 rounded-2xl bg-muted/60 animate-pulse" />
        <div className="h-4 w-80 rounded-xl bg-muted/40 animate-pulse" />
      </div>

      {/* Hero / Banner Skeleton */}
      <div className="rounded-3xl border border-border/60 bg-card/40 p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-3xl bg-muted/60 animate-pulse shrink-0" />
          <div className="space-y-2.5 flex-1">
            <div className="h-7 w-48 rounded-xl bg-muted/70 animate-pulse" />
            <div className="h-4 w-72 rounded bg-muted/40 animate-pulse" />
            <div className="flex gap-2 pt-1">
              <div className="h-6 w-20 rounded-full bg-muted/50 animate-pulse" />
              <div className="h-6 w-24 rounded-full bg-muted/50 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 space-y-4 shadow-sm">
          <div className="h-5 w-40 rounded bg-muted/60 animate-pulse" />
          <div className="space-y-3">
            <div className="h-10 w-full rounded-xl bg-muted/30 animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-muted/30 animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-muted/30 animate-pulse" />
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 space-y-4 shadow-sm">
          <div className="h-5 w-40 rounded bg-muted/60 animate-pulse" />
          <div className="space-y-3">
            <div className="h-10 w-full rounded-xl bg-muted/30 animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-muted/30 animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-muted/30 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
