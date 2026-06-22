interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

const SIZE_CLASSES: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-4',
  lg: 'w-16 h-16 border-4',
}

export function Spinner({ size = 'md', color = 'border-green-600' }: SpinnerProps) {
  const sizeClass = SIZE_CLASSES[size]

  // If a custom color was passed that looks like a Tailwind class, use it directly.
  // Otherwise, treat it as a CSS color value and fall back to inline style.
  const isTailwindClass = /^[a-z]/.test(color) && color.includes('-')
  const borderColorClass = isTailwindClass ? color : 'border-green-600'
  const inlineStyle = !isTailwindClass ? { borderColor: color, borderTopColor: 'transparent' } : undefined

  return (
    <div
      role="status"
      aria-label="Loading"
      className={[
        sizeClass,
        borderColorClass,
        'border-t-transparent rounded-full animate-spin',
      ].join(' ')}
      style={inlineStyle}
    />
  )
}
