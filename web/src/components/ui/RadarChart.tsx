interface RadarDataPoint {
  label: string
  value: number
  max?: number
}

interface RadarChartProps {
  data: RadarDataPoint[]
  color?: string
  size?: number
  className?: string
}

const GRID_LEVELS = 4

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleRad: number
): { x: number; y: number } {
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  }
}

function polygonPoints(
  cx: number,
  cy: number,
  radius: number,
  count: number,
  startAngle: number
): string {
  return Array.from({ length: count }, (_, i) => {
    const angle = startAngle + (2 * Math.PI * i) / count
    const pt = polarToCartesian(cx, cy, radius, angle)
    return `${pt.x},${pt.y}`
  }).join(' ')
}

export function RadarChart({
  data,
  color = '#16a34a',
  size = 200,
  className = '',
}: RadarChartProps) {
  if (!data || data.length < 3) {
    return (
      <div
        className={`flex items-center justify-center text-sm text-gray-400 ${className}`}
        style={{ width: size, height: size }}
      >
        Need at least 3 axes
      </div>
    )
  }

  const n = data.length
  // Start at top (−π/2) and go clockwise
  const startAngle = -Math.PI / 2

  // Padding around the chart to fit labels
  const labelPad = 28
  const cx = size / 2
  const cy = size / 2
  const maxRadius = size / 2 - labelPad

  // Normalize values to 0–1
  const normalized = data.map((d) => {
    const maxVal = d.max !== undefined && d.max > 0 ? d.max : 100
    return Math.min(1, Math.max(0, d.value / maxVal))
  })

  // Grid polygon strings for each level
  const gridPolygons = Array.from({ length: GRID_LEVELS }, (_, lvl) => {
    const r = (maxRadius * (lvl + 1)) / GRID_LEVELS
    return polygonPoints(cx, cy, r, n, startAngle)
  })

  // Axis endpoints
  const axes = data.map((_, i) => {
    const angle = startAngle + (2 * Math.PI * i) / n
    return polarToCartesian(cx, cy, maxRadius, angle)
  })

  // Value polygon
  const valuePts = normalized.map((norm, i) => {
    const angle = startAngle + (2 * Math.PI * i) / n
    return polarToCartesian(cx, cy, maxRadius * norm, angle)
  })
  const valuePolygonPoints = valuePts.map((p) => `${p.x},${p.y}`).join(' ')

  // Label positions (slightly beyond maxRadius)
  const labelPts = data.map((_, i) => {
    const angle = startAngle + (2 * Math.PI * i) / n
    return polarToCartesian(cx, cy, maxRadius + labelPad * 0.85, angle)
  })

  // Text anchor based on x position relative to center
  function textAnchor(x: number): string {
    if (x < cx - 4) return 'end'
    if (x > cx + 4) return 'start'
    return 'middle'
  }

  // dominant-baseline based on y position
  function dominantBaseline(y: number): string {
    if (y < cy - 4) return 'auto'
    if (y > cy + 4) return 'hanging'
    return 'middle'
  }

  // Hex color with alpha for fill
  function hexWithAlpha(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  const fillColor = color.startsWith('#') && color.length === 7
    ? hexWithAlpha(color, 0.2)
    : color

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label="Radar chart"
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Grid polygons */}
        {gridPolygons.map((pts, lvl) => (
          <polygon
            key={`grid-${lvl}`}
            points={pts}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {axes.map((pt, i) => (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={pt.x}
            y2={pt.y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Value polygon fill */}
        <polygon
          points={valuePolygonPoints}
          fill={fillColor}
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Value polygon dots */}
        {valuePts.map((pt, i) => (
          <circle
            key={`dot-${i}`}
            cx={pt.x}
            cy={pt.y}
            r="3.5"
            fill="white"
            stroke={color}
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        {data.map((d, i) => {
          const pt = labelPts[i]
          return (
            <text
              key={`label-${i}`}
              x={pt.x}
              y={pt.y}
              textAnchor={textAnchor(pt.x)}
              dominantBaseline={dominantBaseline(pt.y)}
              fontSize="10"
              fill="#374151"
              fontFamily="inherit"
              fontWeight="500"
            >
              {d.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
