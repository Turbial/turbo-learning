import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../data/useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  function validateField(name: string, value: string, allErrors = errors) {
    const newErrors = { ...allErrors }
    if (name === 'email') {
      newErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? ''
        : 'Enter a valid email address'
    }
    setErrors(newErrors)
    return newErrors
  }

  function handleBlur(field: string, value: string) {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, value)
  }

  const isValid = !Object.values(errors).some(Boolean) && email.length > 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError('')

    const newErrors = validateField('email', email, {})
    setTouched({ email: true })
    if (Object.values(newErrors).some(Boolean)) return

    setLoading(true)
    const result = await resetPassword(email)
    setLoading(false)
    if (result.error) {
      setServerError(result.error)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">⚡</span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Turbo Learning</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center">
              <span className="text-4xl">📬</span>
              <h2 className="mt-4 text-xl font-bold text-gray-900">Check your inbox</h2>
              <p className="mt-2 text-gray-500 text-sm">
                We sent a password reset link to <strong>{email}</strong>.
              </p>
              <Link
                to="/auth/login"
                className="mt-6 inline-block text-green-600 font-semibold hover:text-green-700 text-sm"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Reset your password</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {serverError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email', email)}
                  error={touched.email ? errors.email : undefined}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
                <Button
                  type="submit"
                  loading={loading}
                  disabled={!isValid || loading}
                  className="w-full"
                  size="lg"
                >
                  Send Reset Link
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Remembered it?{' '}
                <Link to="/auth/login" className="text-green-600 font-semibold hover:text-green-700">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
