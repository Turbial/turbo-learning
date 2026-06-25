import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../data/useAuth'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAllPrograms, useEnrollInProgram } from '../data/queries'

const GOALS = [
  { id: 'career', label: 'Advance my career', emoji: '💼' },
  { id: 'productivity', label: 'Be more productive', emoji: '⚡' },
  { id: 'curiosity', label: 'Learn out of curiosity', emoji: '🔍' },
  { id: 'business', label: 'Grow my business', emoji: '🚀' },
  { id: 'skills', label: 'Build new skills', emoji: '🛠️' },
]

const DAILY_MINS = [
  { value: 5, label: '5 min / day', desc: 'Quick daily habit' },
  { value: 10, label: '10 min / day', desc: 'Steady learner' },
  { value: 20, label: '20 min / day', desc: 'Serious learner' },
  { value: 30, label: '30 min / day', desc: 'Fast tracker' },
]

const LEARN_TIMES = [
  { id: 'morning', label: 'Morning', emoji: '🌅' },
  { id: 'lunch', label: 'Lunch break', emoji: '☀️' },
  { id: 'evening', label: 'Evening', emoji: '🌙' },
  { id: 'anytime', label: 'Anytime', emoji: '🕐' },
]

export default function Onboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [name, setName] = useState(user?.user_metadata?.name ?? '')
  const [goal, setGoal] = useState('')
  const [dailyMins, setDailyMins] = useState(10)
  const [learnTime, setLearnTime] = useState('morning')
  const [loading, setLoading] = useState(false)
  const [selectedProgramId, setSelectedProgramId] = useState('')

  const { data: programs = [] } = useAllPrograms()
  const enrollInProgram = useEnrollInProgram()

  // Step 1: name validation
  const [nameError, setNameError] = useState('')
  const [nameTouched, setNameTouched] = useState(false)

  function validateName(val: string) {
    const err = val.trim().length >= 2 ? '' : 'Name must be at least 2 characters'
    setNameError(err)
    return err
  }

  function handleNameBlur() {
    setNameTouched(true)
    validateName(name)
  }

  const nameIsValid = name.trim().length >= 2

  const handleFinish = async () => {
    if (!user) return
    setLoading(true)
    await supabase.from('profiles').upsert(
      { id: user.id, email: user.email, name, goal, daily_mins: dailyMins, learn_time: learnTime, onboarded: true },
      { onConflict: 'id' },
    )
    // Also update user metadata so the auth guard knows
    await supabase.auth.updateUser({ data: { onboarded: true, name } })
    if (selectedProgramId) {
      await enrollInProgram.mutateAsync(selectedProgramId)
    }
    setLoading(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i <= step ? 'bg-green-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="text-6xl mb-4">⚡</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Turbo Learning</h2>
              <p className="text-gray-500 mb-6">
                Master AI, prompt engineering, and LLMs through bite-sized lessons — in just minutes a day.
              </p>
              <div className="space-y-3 text-left mb-8">
                {[
                  { icon: '🎯', text: 'Personalized learning path based on your goals' },
                  { icon: '🔥', text: 'Daily streaks to keep you motivated' },
                  { icon: '🏆', text: 'Compete with others in weekly leagues' },
                  { icon: '⚡', text: 'Earn XP and level up as you progress' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <span className="text-gray-700 text-sm">{text}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => setStep(1)} className="w-full" size="lg">
                Get Started
              </Button>
            </div>
          )}

          {/* Step 1: Name */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What should we call you?</h2>
              <p className="text-gray-500 mb-6">Your name will appear on your profile and leaderboards.</p>
              <div className="mb-6">
                <Input
                  label="Your name"
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    if (nameTouched) validateName(e.target.value)
                  }}
                  onBlur={handleNameBlur}
                  error={nameTouched ? nameError : undefined}
                  placeholder="Your name"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(0)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => {
                    const err = validateName(name)
                    setNameTouched(true)
                    if (!err) setStep(2)
                  }}
                  className="flex-1"
                  disabled={!nameIsValid}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Goal */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What&apos;s your main goal?</h2>
              <p className="text-gray-500 mb-6">We&apos;ll personalize your learning path.</p>
              <div className="space-y-2 mb-6">
                {GOALS.map(({ id, label, emoji }) => (
                  <button
                    key={id}
                    onClick={() => setGoal(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                      goal === id
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="font-medium text-sm">{label}</span>
                    {goal === id && <span className="ml-auto text-green-600">✓</span>}
                  </button>
                ))}
              </div>
              {!goal && (
                <p className="text-xs text-red-500 mb-4">Please select a goal to continue.</p>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1" disabled={!goal}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set your daily schedule</h2>
              <p className="text-gray-500 mb-5">Consistency is key. When do you learn best?</p>

              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">Daily time commitment</p>
                <div className="grid grid-cols-2 gap-2">
                  {DAILY_MINS.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      onClick={() => setDailyMins(value)}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        dailyMins === value
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className={`font-semibold text-sm ${dailyMins === value ? 'text-green-700' : 'text-gray-900'}`}>
                        {label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Preferred learning time</p>
                <div className="grid grid-cols-2 gap-2">
                  {LEARN_TIMES.map(({ id, label, emoji }) => (
                    <button
                      key={id}
                      onClick={() => setLearnTime(id)}
                      className={`p-3 rounded-xl border flex items-center gap-2 transition-colors ${
                        learnTime === id
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{emoji}</span>
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}
          {/* Step 4: Program picker */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pick your program</h2>
              <p className="text-gray-500 mb-6">Start with one — you can switch anytime.</p>
              <div className="space-y-2 mb-6">
                {programs.map((prog) => (
                  <button
                    key={prog.id}
                    onClick={() => setSelectedProgramId(prog.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                      selectedProgramId === prog.id
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="text-2xl">{prog.emoji ?? '📚'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{prog.title}</p>
                      {prog.description && <p className="text-xs text-gray-500 truncate mt-0.5">{prog.description}</p>}
                    </div>
                    {selectedProgramId === prog.id && <span className="text-green-600 flex-shrink-0">✓</span>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStep(3)} className="flex-1">Back</Button>
                <Button onClick={handleFinish} loading={loading} className="flex-1" disabled={!selectedProgramId}>
                  Start Learning!
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
