import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'gray' | 'orange' | 'indigo'
  size?: 'sm' | 'md'
  className?: string
}

const colorMap = {
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  gray: 'bg-gray-100 text-gray-700',
  orange: 'bg-orange-100 text-orange-700',
  indigo: 'bg-indigo-100 text-indigo-700',
}

const sizeMap = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export function Badge({ children, color = 'gray', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${colorMap[color]} ${sizeMap[size]} ${className}`}>
      {children}
    </span>
  )
}
