import { useState, useEffect, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { usePageTitle } from '../../hooks/usePageTitle'

export default function ResetPassword() {
  usePageTitle('Reset Password')

  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) {
        setSessionError(
          'This reset link is invalid or has expired. Please request a new one.',
        )
      } else {
        setSessionReady(true)
      }
    })
  }, [])

  function validateField(
    name: string,
    value: string,
    allErrors = errors,
    currentPassword = password,
    currentConfirm = confirmPassword,
  ) {
    const newErrors = { ...allErrors }
    if (name === 'password') {
      newErrors.password =
        value.length >= 8 ? '' : 'Password must be at least 8 characters'
      // Re-validate confirm if already touched
      if (touched.confirmPassword) {
        newErrors.confirmPassword =
          currentConfirm === value ? '' : 'Passwords do not match'
      }
    }
    if (name === 'confirmPassword') {
      newErrors.confirmPassword =
        value === currentPassword ? '' : 'Passwords do not match'
    }
    setErrors(newErrors)
    return newErrors
  }

  function handleBlur(field: string, value: string) {
    setTouched(prev => ({ ...prev, [field]: true }))
    if (field === 'password') {
      validateField('password', value, errors, value, confirmPassword)
    } else {
      validateField('confirmPassword', value, errors, password, value)
    }
  }

  const isValid =
    !Object.values(errors).some(Boolean) &&
    password.length > 0 &&
    confirmPassword.length > 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError('')

    const newErrors = validateField(
      'confirmPassword',
      confirmPassword,
      validateField('password', password, {}, password, confirmPassword),
      password,
      confirmPassword,
    )
    setTouched({ password: true, confirmPassword: true })
    if (Object.values(newErrors).some(Boolean)) return

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setServerError(error.message)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">⚡</span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Turbo Learning</h1>
          <p className="mt-1 text-gray-500">Set a new password for your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {!sessionReady && !sessionError && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Spinner size="md" />
              <p className="text-sm text-gray-500">Verifying your reset link…</p>
            </div>
          )}

          {sessionError && (
            <div className="text-center">
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {sessionError}
              </div>
              <Link
                to="/auth/forgot-password"
                className="text-green-600 font-semibold hover:text-green-700 text-sm"
              >
                Request a new reset link
              </Link>
            </div>
          )}

          {sessionReady && !success && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Choose a new password
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Must be at least 8 characters.
              </p>

              {serverError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  label="New password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password', password)}
                  error={touched.password ? errors.password : undefined}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <Input
                  label="Confirm password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword', confirmPassword)}
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <Button
                  type="submit"
                  loading={loading}
                  disabled={!isValid || loading}
                  className="w-full"
                  size="lg"
                >
                  Update Password
                </Button>
              </form>
            </>
          )}

          {success && (
            <div className="text-center">
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                Your password has been updated successfully.
              </div>
              <Link
                to="/auth/login"
                className="text-green-600 font-semibold hover:text-green-700 text-sm"
              >
                Sign in with your new password
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
