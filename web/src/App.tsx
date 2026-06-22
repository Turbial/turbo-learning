import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './data/useAuth'
import AppLayout from './components/layout/AppLayout'
import { ToastProvider } from './contexts/ToastContext'
import ErrorBoundary from './components/ui/ErrorBoundary'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// App pages
import Onboard from './pages/Onboard'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Progress from './pages/Progress'
import Leaderboard from './pages/Leaderboard'
import Challenge from './pages/Challenge'
import Profile from './pages/Profile'
import Leagues from './pages/Leagues'
import Shop from './pages/Shop'
import Pricing from './pages/Pricing'
import Lesson from './pages/Lesson'
import Review from './pages/Review'
import AdminIndex from './pages/admin/Index'
import Billing from './pages/profile/Billing'
import Badges from './pages/profile/Badges'
import Portfolio from './pages/profile/Portfolio'
import Settings from './pages/profile/Settings'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
})

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Check onboarding from user metadata
  const onboarded = user?.user_metadata?.onboarded as boolean | undefined
  if (onboarded === false && location.pathname !== '/onboard') {
    return <Navigate to="/onboard" replace />
  }

  return <>{children}</>
}

function PublicGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route
        path="/auth/login"
        element={
          <PublicGuard>
            <Login />
          </PublicGuard>
        }
      />
      <Route
        path="/auth/register"
        element={
          <PublicGuard>
            <Register />
          </PublicGuard>
        }
      />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />

      {/* Onboarding */}
      <Route
        path="/onboard"
        element={
          <AuthGuard>
            <Onboard />
          </AuthGuard>
        }
      />

      {/* Protected app routes */}
      <Route
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/challenge" element={<Challenge />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/leagues" element={<Leagues />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/lesson/:unitId" element={<Lesson />} />
        <Route path="/review" element={<Review />} />
        <Route path="/admin" element={<AdminIndex />} />
        <Route path="/profile/billing" element={<Billing />} />
        <Route path="/profile/badges" element={<Badges />} />
        <Route path="/profile/portfolio" element={<Portfolio />} />
        <Route path="/profile/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
