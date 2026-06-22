import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../data/useAuth'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function Register() {
  const { signUpWithEmail } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmation, setConfirmation] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  function validateField(
    name: string,
    value: string,
    allErrors = errors,
    currentPassword = password,
  ) {
    const newErrors = { ...allErrors }
    if (name === 'name') {
      newErrors.name = value.trim().length >= 2 ? '' : 'Name must be at least 2 characters'
    }
    if (name === 'email') {
      newErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? ''
        : 'Enter a valid email address'
    }
    if (name === 'password') {
      newErrors.password = value.length >= 8 ? '' : 'Password must be at least 8 characters'
      // Re-validate confirm password whenever password changes
      if (touched.confirmPassword || newErrors.confirmPassword !== undefined) {
        newErrors.confirmPassword =
          confirmPassword === value ? '' : 'Passwords do not match'
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
    validateField(field, value, errors, field === 'confirmPassword' ? password : password)
  }

  const isValid =
    !Object.values(errors).some(Boolean) &&
    name.trim().length > 0 &&
    email.length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError('')

    // Validate all fields
    let newErrors = validateField('name', name, {})
    newErrors = validateField('email', email, newErrors)
    newErrors = validateField('password', password, newErrors)
    newErrors = validateField('confirmPassword', confirmPassword, newErrors, password)
    setTouched({ name: true, email: true, password: true, confirmPassword: true })
    if (Object.values(newErrors).some(Boolean)) return

    setLoading(true)
    const result = await signUpWithEmail(email, password, name)
    setLoading(false)
    if (result.error) {
      setServerError(result.error)
    } else if (result.needsConfirmation) {
      setConfirmation(true)
    } else {
      navigate('/onboard')
    }
  }

  if (confirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <span className="text-5xl">📧</span>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-2 text-gray-500">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <p className="mt-4 text-sm text-gray-400">
            Already confirmed?{' '}
            <Link to="/auth/login" className="text-green-600 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">⚡</span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Turbo Learning</h1>
          <p className="mt-1 text-gray-500">Start learning AI & prompting today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Create your account</h2>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => handleBlur('name', name)}
              error={touched.name ? errors.name : undefined}
              placeholder="Your name"
              required
              autoComplete="name"
            />
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
              onChange={e => {
                setPassword(e.target.value)
                if (touched.password) validateField('password', e.target.value)
              }}
              onBlur={() => handleBlur('password', password)}
              error={touched.password ? errors.password : undefined}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={e => {
                setConfirmPassword(e.target.value)
                if (touched.confirmPassword) validateField('confirmPassword', e.target.value, errors, password)
              }}
              onBlur={() => handleBlur('confirmPassword', confirmPassword)}
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
              placeholder="Re-enter your password"
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
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-green-600 font-semibold hover:text-green-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
