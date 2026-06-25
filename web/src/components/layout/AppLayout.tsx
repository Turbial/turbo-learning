import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../data/useAuth'
import { useUnreadNotificationCount } from '../../data/queries'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: unreadCount = 0 } = useUnreadNotificationCount(user?.id)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white rounded-lg shadow p-2 border border-gray-100"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <span className="text-xl leading-none">☰</span>
      </button>

      {/* Mobile notification bell */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 bg-white rounded-lg shadow p-2 border border-gray-100 relative"
        onClick={() => navigate('/notifications')}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <span className="text-xl leading-none">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop overlay — mobile only, appears when sidebar is open */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 min-h-screen md:ml-60 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
