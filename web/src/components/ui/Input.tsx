import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, id, className, ...rest }: InputProps) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  const hasError = Boolean(error)

  const borderClass = hasError
    ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
    : 'border-gray-200 focus:ring-green-500 focus:border-green-500'

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        className={[
          'w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900',
          'placeholder:text-gray-400 outline-none transition',
          'focus:ring-2 focus:ring-offset-0',
          'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
          borderClass,
          className ?? '',
        ].join(' ')}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-xs text-gray-400">
          {hint}
        </p>
      )}
    </div>
  )
}
