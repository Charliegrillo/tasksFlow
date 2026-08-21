'use client'

export function BoardSkeleton() {
  return (
    <div className="flex items-start gap-5 overflow-x-auto pb-4 min-h-screen px-5 py-6 md:px-10">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex w-[290px] min-w-[290px] flex-col gap-3 rounded-sm p-2">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="size-2 rounded-sm bg-muted animate-pulse" />
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="ml-auto h-4 w-6 rounded bg-muted animate-pulse" />
          </div>
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-sm bg-muted animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
              </div>
              <div className="mt-2 flex gap-2">
                <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                <div className="h-3 w-12 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton() {
  return (
    <div className="px-5 py-6 md:px-10">
      <div className="overflow-hidden rounded-sm border border-border bg-card">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between border-b border-border px-4 py-4 last:border-0">
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-48 rounded bg-muted animate-pulse" />
              <div className="h-3 w-32 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-3 w-16 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
