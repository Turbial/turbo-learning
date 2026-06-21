import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../data/useAuth'
import { useProfile, useUpdateProfile } from '../../data/queries'
import { Card } from '../../components/ui/Card'

const GOAL_OPTIONS = [
  { value: 'career_change', label: '🚀 Career Change' },
  { value: 'upskill', label: '📈 Upskill at Work' },
  { value: 'build_products', label: '🔨 Build AI Products' },
  { value: 'stay_current', label: '📰 Stay Current' },
  { value: 'curiosity', label: '💡 Curiosity' },
]

const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Anytime']

export default function Settings() {
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const navigate = useNavigate()

  const [name, setName] = useState(profile?.name ?? '')
  const [goal, setGoal] = useState(profile?.goal ?? '')
  const [dailyMins, setDailyMins] = useState(profile?.daily_mins ?? 15)
  const [learnTime, setLearnTime] = useState(profile?.learn_time ?? 'Anytime')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile.mutateAsync({ name, goal, daily_mins: dailyMins, learn_time: learnTime })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/auth/login')
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                value={user?.email ?? ''}
                disabled
                className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        {/* Learning preferences */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">Learning Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">My Goal</label>
              <div className="space-y-2">
                {GOAL_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${goal === opt.value ? 'border-green-400 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <input
                      type="radio"
                      name="goal"
                      value={opt.value}
                      checked={goal === opt.value}
                      onChange={() => setGoal(opt.value)}
                      className="accent-green-600"
                    />
                    <span className="text-sm font-medium text-gray-800">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Minutes: <span className="text-green-600 font-bold">{dailyMins} min</span>
              </label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={dailyMins}
                onChange={e => setDailyMins(Number(e.target.value))}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Best Learning Time</label>
              <div className="grid grid-cols-2 gap-2">
                {TIME_OPTIONS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLearnTime(t)}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${learnTime === t ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-700 hover:border-green-300'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <p className="text-sm text-green-700 font-medium">Settings saved!</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl py-3 font-semibold transition-colors"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>

      {/* Danger zone */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">Account</h2>
        <button
          onClick={handleSignOut}
          className="w-full py-2.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
        >
          Sign Out
        </button>
      </Card>
    </div>
  )
}
