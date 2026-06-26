interface HeatmapCalendarProps {
  activeDates: Set<string>
  weeks?: number
  className?: string
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Returns Monday of the week containing `date`
function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const dow = d.getDay() // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function HeatmapCalendar({
  activeDates,
  weeks = 16,
  className = '',
}: HeatmapCalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Start from the Monday `weeks` weeks ago
  const latestMonday = getMondayOf(today)
  const startMonday = new Date(latestMonday)
  startMonday.setDate(startMonday.getDate() - (weeks - 1) * 7)

  // Build grid: columns = weeks, rows = 7 days (Mon=0 … Sun=6)
  const grid: (Date | null)[][] = []
  for (let w = 0; w < weeks; w++) {
    const col: (Date | null)[] = []
    for (let d = 0; d < 7; d++) {
      const cell = new Date(startMonday)
      cell.setDate(cell.getDate() + w * 7 + d)
      col.push(cell > today ? null : cell)
    }
    grid.push(col)
  }

  // Month labels: find which week column a month change first appears
  const monthLabels: { weekIdx: number; label: string }[] = []
  let lastMonth = -1
  for (let w = 0; w < weeks; w++) {
    const firstNonNull = grid[w].find((d) => d !== null)
    if (firstNonNull) {
      const m = firstNonNull.getMonth()
      if (m !== lastMonth) {
        monthLabels.push({ weekIdx: w, label: MONTHS[m] })
        lastMonth = m
      }
    }
  }

  const cellSize = 12   // px square
  const cellGap = 3     // px gap
  const step = cellSize + cellGap
  const labelRowHeight = 18
  const dayLabelWidth = 28

  const svgWidth = dayLabelWidth + weeks * step - cellGap
  const svgHeight = labelRowHeight + 7 * step - cellGap

  return (
    <div className={`overflow-x-auto ${className}`}>
      <svg
        width={svgWidth}
        height={svgHeight}
        aria-label="Activity heatmap"
        style={{ display: 'block' }}
      >
        {/* Month labels */}
        {monthLabels.map(({ weekIdx, label }) => (
          <text
            key={`month-${weekIdx}`}
            x={dayLabelWidth + weekIdx * step}
            y={labelRowHeight - 4}
            fontSize="9"
            fill="#6b7280"
            fontFamily="inherit"
          >
            {label}
          </text>
        ))}

        {/* Day-of-week labels */}
        {DAYS_OF_WEEK.map((day, di) => {
          // Only show Mon, Wed, Fri, Sun to avoid crowding
          if (di % 2 === 1 && di !== 6) return null
          return (
            <text
              key={`day-${di}`}
              x={0}
              y={labelRowHeight + di * step + cellSize - 1}
              fontSize="8"
              fill="#9ca3af"
              fontFamily="inherit"
            >
              {day.slice(0, 1)}
            </text>
          )
        })}

        {/* Cells */}
        {grid.map((col, wi) =>
          col.map((cell, di) => {
            const x = dayLabelWidth + wi * step
            const y = labelRowHeight + di * step
            if (cell === null) {
              // future or out-of-range
              return null
            }
            const iso = toISODate(cell)
            const active = activeDates.has(iso)
            const isToday = iso === toISODate(today)
            return (
              <rect
                key={`${wi}-${di}`}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx="2"
                ry="2"
                className={active ? 'fill-green-400' : 'fill-gray-100'}
                stroke={isToday ? '#16a34a' : 'none'}
                strokeWidth={isToday ? 1.5 : 0}
              >
                <title>{iso}{active ? ' — active' : ''}</title>
              </rect>
            )
          })
        )}
      </svg>
    </div>
  )
}
