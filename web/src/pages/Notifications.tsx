import { useAuth } from '../data/useAuth'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type Notification,
} from '../data/queries'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { usePageTitle } from '../hooks/usePageTitle'

const TYPE_META: Record<string, { icon: string; color: string }> = {
  streak_at_risk:   { icon: '🔥', color: 'text-orange-500' },
  badge_earned:     { icon: '🎖️', color: 'text-amber-500' },
  league_promotion: { icon: '🏆', color: 'text-yellow-500' },
  weekly_summary:   { icon: '📊', color: 'text-blue-500' },
  lesson_reminder:  { icon: '📚', color: 'text-green-500' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function NotificationRow({
  n,
  onRead,
}: {
  n: Notification
  onRead: (id: string) => void
}) {
  const meta = TYPE_META[n.type] ?? { icon: '🔔', color: 'text-gray-500' }
  return (
    <button
      onClick={() => !n.read && onRead(n.id)}
      className={`w-full text-left flex items-start gap-4 px-5 py-4 border-b border-gray-50 last:border-0 transition-colors ${
        n.read ? 'bg-white' : 'bg-green-50/40 hover:bg-green-50'
      }`}
    >
      <span className={`text-2xl mt-0.5 flex-shrink-0 ${meta.color}`} aria-hidden="true">
        {meta.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
          {n.title}
        </p>
        {n.body && (
          <p className="text-sm text-gray-500 mt-0.5 leading-snug">{n.body}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
      </div>
      {!n.read && (
        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-2" aria-label="Unread" />
      )}
    </button>
  )
}

export default function Notifications() {
  usePageTitle('Notifications')
  const { user } = useAuth()
  const { data: notifications = [], isLoading } = useNotifications(user?.id)
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const unreadCount = notifications.filter(n => !n.read).length

  function handleMarkAll() {
    if (user?.id) markAllRead.mutate(user.id)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={markAllRead.isPending}
            className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-60"
          >
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="All caught up"
          description="Notifications about your streak, badges, and league activity will appear here."
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          {notifications.map(n => (
            <NotificationRow key={n.id} n={n} onRead={id => markRead.mutate(id)} />
          ))}
        </Card>
      )}
    </div>
  )
}
