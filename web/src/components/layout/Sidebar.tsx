import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../data/useAuth'
import { useProfile } from '../../data/queries'
import { Avatar } from '../ui/Avatar'
import { ProgressBar } from '../ui/ProgressBar'

function xpToLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}
function xpToNextLevel(xp: number) {
  const level = xpToLevel(xp)
  return level * level * 100 - xp
}
function xpForLevel(level: number) {
  return (level - 1) * (level - 1) * 100
}

const navItems = [
  { to: '/', label: 'Journey', icon: '🗺️', exact: true },
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/progress', label: 'Progress', icon: '📈' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { to: '/challenge', label: 'Daily Challenge', icon: '⚡' },
  { to: '/challenge/history', label: 'Challenge History', icon: '📅' },
  { to: '/review', label: 'Review', icon: '🔁' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/programs', label: 'Programs', icon: '📚' },
  { to: '/practice', label: 'AI Practice', icon: '🧪' },
  { to: '/notes', label: 'My Notes', icon: '📝' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

const bottomItems = [
  { to: '/leagues', label: 'Leagues', icon: '🎖️' },
  { to: '/shop', label: 'Shop', icon: '🛡️' },
  { to: '/pricing', label: 'Upgrade', icon: '⭐' },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const { signOut } = useAuth()
  const { data: profile } = useProfile()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth/login')
  }

  const xp = profile?.xp ?? 0
  const level = xpToLevel(xp)
  const nextLevelXp = xpForLevel(level + 1)
  const currentLevelXp = xpForLevel(level)
  const levelProgress = xp - currentLevelXp
  const levelTotal = nextLevelXp - currentLevelXp

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-60 bg-gray-900 text-white flex flex-col z-40 overflow-y-auto transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Mobile close button */}
      <button
        className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white p-1"
        onClick={onClose}
        aria-label="Close menu"
      >
        <span className="text-xl leading-none">×</span>
      </button>

      {/* Brand */}
      <div className="px-5 py-6 border-b border-gray-800">
        <NavLink to="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">⚡</span>
          <span className="font-bold text-white text-lg leading-tight">Turbo Learning</span>
        </NavLink>
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-gray-800">
        <NavLink to="/profile" className="flex items-center gap-3 no-underline hover:opacity-90 transition-opacity">
          <Avatar name={profile?.name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{profile?.name ?? 'Learner'}</p>
            <p className="text-xs text-gray-400">Level {level} · {xp} XP</p>
          </div>
        </NavLink>
        <div className="mt-2">
          <ProgressBar value={levelProgress} max={levelTotal} size="sm" color="bg-green-500" />
          <p className="text-xs text-gray-500 mt-0.5">{xpToNextLevel(xp)} XP to Level {level + 1}</p>
        </div>
      </div>

      {/* Streak */}
      {profile && (
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-orange-400 text-lg">🔥</span>
            <span className="text-sm text-gray-300">
              <span className="font-bold text-white">{profile.streak}</span> day streak
            </span>
          </div>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map(({ to, label, icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 pb-3 pt-2 border-t border-gray-800 space-y-0.5">
        {bottomItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span className="text-base">🚪</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
