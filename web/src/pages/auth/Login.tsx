import { useState, FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../data/useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function Login() {
  const { signInWithEmail } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  function validateField(name: string, value: string, allErrors = errors) {
    const newErrors = { ...allErrors }
    if (name === 'email') {
      newErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? ''
        : 'Enter a valid email address'
    }
    if (name === 'password') {
      newErrors.password = value.length >= 8 ? '' : 'Password must be at least 8 characters'
    }
    setErrors(newErrors)
    return newErrors
  }

  function handleBlur(field: string, value: string) {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, value)
  }

  const isValid =
    !Object.values(errors).some(Boolean) &&
    email.length > 0 &&
    password.length > 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError('')

    // Touch all fields and validate
    const newErrors = validateField('email', email, validateField('password', password, {}))
    setTouched({ email: true, password: true })
    if (Object.values(newErrors).some(Boolean)) return

    setLoading(true)
    const result = await signInWithEmail(email, password)
    setLoading(false)
    if (result.error) {
      setServerError(result.error)
    } else {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">⚡</span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Turbo Learning</h1>
          <p className="mt-1 text-gray-500">Sign in to continue learning</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Welcome back</h2>

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
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => handleBlur('password', password)}
              error={touched.password ? errors.password : undefined}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <div className="flex justify-end">
              <Link to="/auth/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              loading={loading}
              disabled={!isValid || loading}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link to="/auth/register" className="text-green-600 font-semibold hover:text-green-700">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
