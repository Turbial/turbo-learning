import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './data/useAuth'
import AppLayout from './components/layout/AppLayout'
import { ToastProvider } from './contexts/ToastContext'
import ErrorBoundary from './components/ui/ErrorBoundary'
import { CookieConsent } from './components/CookieConsent'

// ─── Lazy-loaded pages (code splitting) ───
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))

const Onboard = lazy(() => import('./pages/Onboard'))
const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Progress = lazy(() => import('./pages/Progress'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Challenge = lazy(() => import('./pages/Challenge'))
const Profile = lazy(() => import('./pages/Profile'))
const Leagues = lazy(() => import('./pages/Leagues'))
const Shop = lazy(() => import('./pages/Shop'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Lesson = lazy(() => import('./pages/Lesson'))
const Review = lazy(() => import('./pages/Review'))
const Programs = lazy(() => import('./pages/Programs'))
const Notes = lazy(() => import('./pages/Notes'))
const Notifications = lazy(() => import('./pages/Notifications'))
const ChallengeHistory = lazy(() => import('./pages/ChallengeHistory'))
const Practice = lazy(() => import('./pages/Practice'))
const AdminIndex = lazy(() => import('./pages/admin/Index'))
const Billing = lazy(() => import('./pages/profile/Billing'))
const Badges = lazy(() => import('./pages/profile/Badges'))
const Portfolio = lazy(() => import('./pages/profile/Portfolio'))
const Settings = lazy(() => import('./pages/profile/Settings'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const NotFound = lazy(() => import('./pages/NotFound'))

const PageLoader = (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm text-gray-400 font-medium">Loading…</p>
    </div>
  </div>
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
  },
})

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return PageLoader

  if (!session) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  const onboarded = user?.user_metadata?.onboarded as boolean | undefined
  if (onboarded === false && location.pathname !== '/onboard') {
    return <Navigate to="/onboard" replace />
  }

  return <>{children}</>
}

function PublicGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth()

  if (isLoading) return PageLoader
  if (session) return <Navigate to="/" replace />

  return <>{children}</>
}

const ADMIN_EMAILS = ['mvk8000@gmail.com']

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return PageLoader

  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email)
  if (!isAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Suspense fallback={PageLoader}>
      <Routes>
        {/* Public — always accessible */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        {/* Public auth — redirect to app if already logged in */}
        <Route path="/auth/login" element={<PublicGuard><Login /></PublicGuard>} />
        <Route path="/auth/register" element={<PublicGuard><Register /></PublicGuard>} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />

        {/* Onboarding */}
        <Route path="/onboard" element={<AuthGuard><Onboard /></AuthGuard>} />

        {/* Protected app routes */}
        <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
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
          <Route path="/programs" element={<Programs />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/challenge/history" element={<ChallengeHistory />} />
          <Route path="/admin" element={<AdminGuard><AdminIndex /></AdminGuard>} />
          <Route path="/profile/billing" element={<Billing />} />
          <Route path="/profile/badges" element={<Badges />} />
          <Route path="/profile/portfolio" element={<Portfolio />} />
          <Route path="/profile/settings" element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppRoutes />
            <CookieConsent />
          </BrowserRouter>
        </QueryClientProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}
