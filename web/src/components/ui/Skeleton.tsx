interface SkeletonProps {
  className?: string
  lines?: number
}

const LINE_WIDTHS = ['w-full', 'w-4/5', 'w-3/5']

export function Skeleton({ className, lines }: SkeletonProps) {
  if (lines !== undefined && lines > 0) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={[
              'h-4 rounded-lg bg-gray-200 animate-pulse',
              LINE_WIDTHS[i % LINE_WIDTHS.length],
            ].join(' ')}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={[
        'bg-gray-200 animate-pulse rounded-xl',
        className ?? 'h-10 w-full',
      ].join(' ')}
    />
  )
}
