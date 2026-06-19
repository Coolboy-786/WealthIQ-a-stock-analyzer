export function DeepDiveSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Header card */}
      <div className="rounded-2xl border border-white/[0.06] bg-slate-900/80 p-5 backdrop-blur-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-44 animate-pulse rounded-lg bg-slate-800" />
              <div className="h-5 w-20 animate-pulse rounded-md bg-slate-800/60" />
            </div>
            <div className="h-4 w-36 animate-pulse rounded-md bg-slate-800/50" />
          </div>
          <div className="h-8 w-28 animate-pulse rounded-full bg-slate-800" />
        </div>
        <div className="mt-4 flex gap-5 border-t border-white/[0.05] pt-3">
          <div className="h-3 w-28 animate-pulse rounded-md bg-slate-800/50" />
          <div className="h-3 w-36 animate-pulse rounded-md bg-slate-800/50" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-slate-900/80 backdrop-blur-sm">
        <div className="flex min-w-max px-1">
          {["Snapshot", "Valuation", "Growth", "Health", "Returns", "Peers", "Ownership", "The View"].map(
            (label) => (
              <div key={label} className="px-4 py-3.5">
                <div
                  className="h-4 animate-pulse rounded-md bg-slate-800"
                  style={{ width: `${label.length * 7 + 4}px` }}
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-white/[0.06] bg-slate-900/80 p-5 backdrop-blur-sm sm:p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4 space-y-2"
            >
              <div className="h-3 w-14 animate-pulse rounded-md bg-slate-800" />
              <div className="h-6 w-20 animate-pulse rounded-md bg-slate-800" />
              <div className="h-3 w-10 animate-pulse rounded-md bg-slate-800/50" />
            </div>
          ))}
        </div>

        {/* Narrative lines */}
        <div className="space-y-2">
          {[100, 91, 83, 70].map((w, i) => (
            <div
              key={i}
              className="h-3.5 animate-pulse rounded-md bg-slate-800/60"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>

        {/* Second stat row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/[0.06] bg-slate-950/60 p-4 space-y-2"
            >
              <div className="h-3 w-16 animate-pulse rounded-md bg-slate-800" />
              <div className="h-6 w-14 animate-pulse rounded-md bg-slate-800" />
            </div>
          ))}
        </div>

        {/* Loading label */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500/60 animate-pulse" />
          <span className="text-xs text-slate-600 animate-pulse">Fetching live data & generating analysis…</span>
        </div>
      </div>
    </div>
  );
}
