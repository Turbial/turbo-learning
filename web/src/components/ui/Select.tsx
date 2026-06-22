import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
}

export function Select({ label, error, options, id, className, ...rest }: SelectProps) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  const hasError = Boolean(error)

  const borderClass = hasError
    ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
    : 'border-gray-200 focus:ring-green-500 focus:border-green-500'

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        aria-invalid={hasError}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={[
          'w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900',
          'outline-none transition appearance-none bg-white',
          'focus:ring-2 focus:ring-offset-0',
          'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
          borderClass,
          className ?? '',
        ].join(' ')}
        {...rest}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
