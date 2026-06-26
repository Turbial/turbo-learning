interface DataPoint {
  label: string
  value: number
}

interface LineChartProps {
  data: DataPoint[]
  color?: string
  height?: number
  className?: string
}

function getVisibleLabels(data: DataPoint[]): Set<number> {
  const len = data.length
  if (len <= 7) return new Set(data.map((_, i) => i))
  const mid = Math.floor(len / 2)
  return new Set([0, mid, len - 1])
}

export function LineChart({
  data,
  color = '#16a34a',
  height = 120,
  className = '',
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-sm text-gray-400 ${className}`}
        style={{ height }}
      >
        No data
      </div>
    )
  }

  const paddingLeft = 8
  const paddingRight = 8
  const paddingTop = 10
  const paddingBottom = 28
  const labelAreaWidth = 300
  const chartWidth = labelAreaWidth
  const chartHeight = height - paddingTop - paddingBottom

  const values = data.map((d) => d.value)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const valueRange = rawMax === rawMin ? 1 : rawMax - rawMin

  const innerWidth = chartWidth - paddingLeft - paddingRight

  const xStep = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth

  function toX(i: number): number {
    return paddingLeft + (data.length > 1 ? i * xStep : innerWidth / 2)
  }

  function toY(v: number): number {
    return paddingTop + chartHeight - ((v - rawMin) / valueRange) * chartHeight
  }

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }))

  // Build smooth polyline path using cardinal spline
  function buildPath(pts: { x: number; y: number }[]): string {
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`
    const tension = 0.3
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(pts.length - 1, i + 2)]
      const cp1x = p1.x + (p2.x - p0.x) * tension
      const cp1y = p1.y + (p2.y - p0.y) * tension
      const cp2x = p2.x - (p3.x - p1.x) * tension
      const cp2y = p2.y - (p3.y - p1.y) * tension
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }
    return d
  }

  const linePath = buildPath(points)

  // Area fill: same path but closed to bottom
  const firstPt = points[0]
  const lastPt = points[points.length - 1]
  const bottomY = paddingTop + chartHeight
  const areaPath =
    linePath +
    ` L ${lastPt.x} ${bottomY} L ${firstPt.x} ${bottomY} Z`

  const gradientId = `lc-grad-${color.replace('#', '')}`
  const visibleLabels = getVisibleLabels(data)

  const svgHeight = height

  return (
    <div className={className}>
      <svg
        width="100%"
        viewBox={`0 0 ${chartWidth} ${svgHeight}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {points.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r="3.5"
            fill="white"
            stroke={color}
            strokeWidth="2"
          />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => {
          if (!visibleLabels.has(i)) return null
          const x = toX(i)
          const anchor =
            i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'
          return (
            <text
              key={i}
              x={x}
              y={svgHeight - 4}
              textAnchor={anchor}
              fontSize="10"
              fill="#9ca3af"
              fontFamily="inherit"
            >
              {d.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
