import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'

function useAdminStats() {
  return useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      const [users, completions, enrollments] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('lesson_progress').select('id', { count: 'exact', head: true }),
        supabase.from('enrollments').select('id', { count: 'exact', head: true }),
      ])
      return {
        totalUsers: users.count ?? 0,
        totalCompletions: completions.count ?? 0,
        totalEnrollments: enrollments.count ?? 0,
      }
    },
    staleTime: 30_000,
  })
}

function useRecentUsers() {
  return useQuery({
    queryKey: ['admin_recent_users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, xp, streak, created_at')
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data as { id: string; name?: string; email?: string; xp: number; streak: number; created_at: string }[]
    },
    staleTime: 30_000,
  })
}

export default function AdminIndex() {
  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: users, isLoading: usersLoading } = useRecentUsers()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: '👥' },
          { label: 'Lesson Completions', value: stats?.totalCompletions ?? '—', icon: '✅' },
          { label: 'Enrollments', value: stats?.totalEnrollments ?? '—', icon: '📋' },
        ].map(stat => (
          <Card key={stat.label} className="text-center">
            <p className="text-3xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold text-gray-900">
              {statsLoading ? '…' : stat.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Recent users */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Recent Users</h2>
        {usersLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">User</th>
                  <th className="pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">XP</th>
                  <th className="pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Streak</th>
                  <th className="pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(users ?? []).map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{u.name || 'Unnamed'}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 font-medium text-green-600">{u.xp?.toLocaleString()}</td>
                    <td className="py-3">
                      {u.streak > 0 ? (
                        <span className="text-orange-500 font-medium">{u.streak} 🔥</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
