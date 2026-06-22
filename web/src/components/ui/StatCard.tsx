type StatCardColor = 'green' | 'orange' | 'blue' | 'purple' | 'gray'

interface StatCardProps {
  value: string | number
  label: string
  icon?: string
  color?: StatCardColor
}

const COLOR_MAP: Record<StatCardColor, string> = {
  green: 'text-green-600',
  orange: 'text-orange-500',
  blue: 'text-blue-600',
  purple: 'text-purple-600',
  gray: 'text-gray-900',
}

export function StatCard({ value, label, icon, color = 'gray' }: StatCardProps) {
  const colorClass = COLOR_MAP[color]

  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 p-6 gap-1">
      {icon && (
        <span className="text-3xl leading-none mb-1" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={`text-3xl font-bold leading-none ${colorClass}`}>
        {value}
      </span>
      <span className="text-sm text-gray-500 font-medium text-center">{label}</span>
    </div>
  )
}
