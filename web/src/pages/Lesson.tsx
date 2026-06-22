import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../data/useAuth'
import { useUnit, useCompleteLesson } from '../data/queries'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

// ─── Lesson steps query ───
interface LessonRow {
  id: string
  title: string | null
  steps: unknown
  content: unknown
}

function useLessonSteps(unitId?: string) {
  return useQuery({
    queryKey: ['lessonSteps', unitId],
    enabled: !!unitId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, steps, content')
        .eq('unit_id', unitId)
        .order('order_num', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as LessonRow | null
    },
    staleTime: 5 * 60_000,
  })
}

// ─── Step types ───
interface BaseStep {
  type: string
  id?: string
}
interface InfoStep extends BaseStep {
  type: 'info' | 'example' | 'highlight' | 'scenario_card'
  title?: string
  body?: string
  text?: string
  content?: string
  quote?: string
}
interface McStep extends BaseStep {
  type: 'mc'
  question?: string
  options?: string[]
  correct?: number
  correct_index?: number
}
interface TfStep extends BaseStep {
  type: 'tf'
  question?: string
  answer?: boolean
  correct?: boolean
}
interface FillBlankStep extends BaseStep {
  type: 'fill_blank'
  sentence?: string
  blank?: string
  answer?: string
}
type Step = InfoStep | McStep | TfStep | FillBlankStep | (BaseStep & Record<string, unknown>)

// ─── Step renderer components ───
function InfoCard({ step }: { step: Step }) {
  const s = step as InfoStep
  const body = s.body ?? s.text ?? (s.content as string | undefined) ?? ''
  return (
    <div className="space-y-4">
      {s.title && <h2 className="text-xl font-bold text-gray-900">{s.title}</h2>}
      {s.quote ? (
        <blockquote className="border-l-4 border-green-400 pl-4 italic text-gray-700 text-base leading-relaxed">
          {s.quote}
        </blockquote>
      ) : null}
      {body && <p className="text-gray-700 leading-relaxed">{body}</p>}
    </div>
  )
}

function McRenderer({
  step,
  onAdvance,
}: {
  step: McStep
  onAdvance: () => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const correctIdx = step.correct_index ?? step.correct ?? 0
  const options = step.options ?? []

  function handleSelect(i: number) {
    if (selected !== null) return
    setSelected(i)
    timerRef.current = setTimeout(() => {
      onAdvance()
    }, 1200)
  }

  return (
    <div className="space-y-4">
      {step.question && (
        <p className="text-lg font-semibold text-gray-900 leading-snug">{step.question}</p>
      )}
      <div className="space-y-2">
        {options.map((opt, i) => {
          let cls =
            'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors '
          if (selected === null) {
            cls += 'border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-700'
          } else if (i === correctIdx) {
            cls += 'border-green-500 bg-green-50 text-green-700'
          } else if (i === selected && i !== correctIdx) {
            cls += 'border-red-300 bg-red-50 text-red-600'
          } else {
            cls += 'border-gray-100 text-gray-400'
          }
          return (
            <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null} className={cls}>
              {opt}
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <p className={`text-sm font-medium ${selected === correctIdx ? 'text-green-600' : 'text-red-500'}`}>
          {selected === correctIdx ? '✓ Correct!' : `✗ The correct answer was: ${options[correctIdx]}`}
        </p>
      )}
    </div>
  )
}

function TfRenderer({ step, onAdvance }: { step: TfStep; onAdvance: () => void }) {
  const [selected, setSelected] = useState<boolean | null>(null)
  const correct = step.answer ?? step.correct ?? true

  function handleSelect(val: boolean) {
    if (selected !== null) return
    setSelected(val)
    setTimeout(onAdvance, 1200)
  }

  return (
    <div className="space-y-4">
      {step.question && (
        <p className="text-lg font-semibold text-gray-900 leading-snug">{step.question}</p>
      )}
      <div className="flex gap-3">
        {([true, false] as const).map((val) => {
          let cls = 'flex-1 py-3 rounded-xl border font-semibold text-sm transition-colors '
          if (selected === null) {
            cls += 'border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-700'
          } else if (val === correct) {
            cls += 'border-green-500 bg-green-50 text-green-700'
          } else if (val === selected && val !== correct) {
            cls += 'border-red-300 bg-red-50 text-red-600'
          } else {
            cls += 'border-gray-100 text-gray-400'
          }
          return (
            <button key={String(val)} onClick={() => handleSelect(val)} disabled={selected !== null} className={cls}>
              {val ? 'True' : 'False'}
            </button>
          )
        })}
      </div>
      {selected !== null && (
        <p className={`text-sm font-medium ${selected === correct ? 'text-green-600' : 'text-red-500'}`}>
          {selected === correct ? '✓ Correct!' : `✗ The correct answer is ${correct ? 'True' : 'False'}`}
        </p>
      )}
    </div>
  )
}

function FillBlankRenderer({ step, onAdvance }: { step: FillBlankStep; onAdvance: () => void }) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const answer = step.answer ?? ''

  function handleSubmit() {
    setSubmitted(true)
    setTimeout(onAdvance, 1500)
  }

  const sentence = step.sentence ?? ''
  const blank = step.blank ?? '___'
  const displayText = sentence.replace(blank, submitted ? (answer || '___') : '___')

  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold text-gray-900 leading-snug">{displayText}</p>
      {!submitted ? (
        <>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && input.trim() && handleSubmit()}
            placeholder="Type your answer…"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="w-full bg-green-600 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Submit
          </button>
        </>
      ) : (
        <p className="text-sm text-gray-500">Answer: <span className="font-semibold text-green-700">{answer}</span></p>
      )}
    </div>
  )
}

// ─── Fallback cards for empty steps ───
function FallbackSteps({ unit }: { unit: { title?: string; goal?: string } | undefined }) {
  return [
    {
      title: unit?.title ?? 'Lesson Overview',
      body: unit?.goal ?? 'In this lesson you will explore key concepts and build practical skills.',
    },
    {
      title: 'Key Takeaways',
      body: 'Focus on understanding the core ideas. Apply them in real situations as you encounter them.',
    },
    {
      title: 'Keep It Up!',
      body: 'Consistent practice is how skills are built. Come back tomorrow to reinforce what you learned today.',
    },
  ]
}

// ─── Main component ───
export default function Lesson() {
  const { unitId } = useParams<{ unitId: string }>()
  const { user: _user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const completeLesson = useCompleteLesson()

  const [phase, setPhase] = useState<'intro' | 'playing' | 'complete'>('intro')
  const [stepIdx, setStepIdx] = useState(0)
  const [completing, setCompleting] = useState(false)

  const { data: unit, isLoading: unitLoading } = useUnit(unitId)
  const { data: lesson, isLoading: lessonLoading } = useLessonSteps(unitId)

  usePageTitle(unit?.title ?? 'Lesson')

  const LESSON_XP = 50

  // Parse steps from DB
  const rawSteps: Step[] = (() => {
    if (!lesson) return []
    const raw = lesson.steps ?? lesson.content
    if (!raw) return []
    if (Array.isArray(raw)) return raw as Step[]
    if (typeof raw === 'string') {
      try { return JSON.parse(raw) as Step[] } catch { return [] }
    }
    return []
  })()

  const useFallback = rawSteps.length === 0
  const fallbackCards = FallbackSteps({ unit })
  const totalSteps = useFallback ? fallbackCards.length : rawSteps.length

  async function handleComplete() {
    if (!unitId) return
    setCompleting(true)
    try {
      await completeLesson.mutateAsync({ unitId, xpEarned: LESSON_XP, score: 100 })
      setPhase('complete')
    } catch (err) {
      console.error('Failed to complete lesson:', err)
      toast.error('Failed to save lesson progress. Please try again.')
    } finally {
      setCompleting(false)
    }
  }

  function handleNext() {
    if (stepIdx + 1 >= totalSteps) {
      handleComplete()
    } else {
      setStepIdx((i) => i + 1)
    }
  }

  // ── Phase: complete ──
  if (phase === 'complete') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lesson Complete!</h1>
          <p className="text-gray-500 mb-2">{unit?.title ?? 'Lesson'}</p>
          <div className="bg-green-50 rounded-xl p-4 mb-6 inline-block mx-auto">
            <p className="text-2xl font-bold text-green-600">+{LESSON_XP} XP</p>
            <p className="text-sm text-green-600/70">earned</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-semibold transition-colors"
            >
              Back to Journey
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full border border-gray-200 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-50 transition-colors"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Phase: intro ──
  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to Journey
        </button>

        {unitLoading || lessonLoading ? (
          <Card>
            <Skeleton className="h-14 w-14 rounded-2xl mb-4" />
            <Skeleton lines={3} />
          </Card>
        ) : (
          <>
            <Card>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                  {unit?.emoji ?? '📖'}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-600 mb-1 uppercase tracking-wide">Today's Lesson</p>
                  <h1 className="text-xl font-bold text-gray-900 mb-1">
                    {unit?.title ?? `Lesson ${unitId?.slice(-4)}`}
                  </h1>
                  {unit?.goal && (
                    <p className="text-sm text-gray-500">{unit.goal}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      +{LESSON_XP} XP
                    </span>
                    <span className="text-xs text-gray-400">{totalSteps} steps</span>
                    <span className="text-xs text-gray-400">~{Math.max(5, totalSteps * 1)} min</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="font-semibold text-gray-900 mb-3">What you'll learn</h2>
              <div className="space-y-2">
                {[
                  'Core concepts and practical applications',
                  'Real-world examples you can use immediately',
                  'Quick knowledge check to reinforce learning',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 text-sm">✓</span>
                    <p className="text-sm text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white text-center">
              <p className="text-white/80 text-sm mb-1">Ready to learn?</p>
              <h2 className="text-xl font-bold mb-4">Start this lesson</h2>
              <button
                onClick={() => setPhase('playing')}
                className="bg-white text-green-700 hover:bg-green-50 rounded-xl px-8 py-3 font-bold text-sm transition-colors"
              >
                Begin Lesson →
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Phase: playing ──
  const progress = ((stepIdx + 1) / totalSteps) * 100

  function renderCurrentStep() {
    if (useFallback) {
      const card = fallbackCards[stepIdx]
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">{card.title}</h2>
          <p className="text-gray-700 leading-relaxed">{card.body}</p>
        </div>
      )
    }

    const step = rawSteps[stepIdx]
    if (!step) return null

    switch (step.type) {
      case 'info':
      case 'example':
      case 'highlight':
      case 'scenario_card':
        return <InfoCard step={step} />
      case 'mc':
        return <McRenderer step={step as McStep} onAdvance={handleNext} />
      case 'tf':
        return <TfRenderer step={step as TfStep} onAdvance={handleNext} />
      case 'fill_blank':
        return <FillBlankRenderer step={step as FillBlankStep} onAdvance={handleNext} />
      default: {
        // Generic fallback card
        const s = step as Record<string, unknown>
        const body = (s.body ?? s.text ?? s.content ?? '') as string
        const title = (s.title ?? '') as string
        return (
          <div className="space-y-3">
            {title && <h2 className="text-xl font-bold text-gray-900">{title}</h2>}
            {body && <p className="text-gray-700 leading-relaxed">{body}</p>}
            {!title && !body && (
              <p className="text-gray-500 text-sm">Continue to the next step.</p>
            )}
          </div>
        )
      }
    }
  }

  const currentStep = useFallback ? null : rawSteps[stepIdx]
  const isInteractive =
    !useFallback &&
    currentStep &&
    (currentStep.type === 'mc' || currentStep.type === 'tf' || currentStep.type === 'fill_blank')

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPhase('intro')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <span className="text-sm font-medium text-gray-500">
          Step {stepIdx + 1} of {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step card */}
      <Card>
        <p className="text-xs font-medium text-green-600 mb-4 uppercase tracking-wide">
          {unit?.title ?? 'Lesson'}
        </p>
        {renderCurrentStep()}
      </Card>

      {/* Next button — only show for non-interactive steps */}
      {!isInteractive && (
        <button
          onClick={handleNext}
          disabled={completing}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl py-3 font-semibold transition-colors"
        >
          {completing
            ? 'Saving…'
            : stepIdx + 1 >= totalSteps
            ? 'Mark Complete ✓'
            : 'Next →'}
        </button>
      )}

      {/* For interactive steps, show a skip link */}
      {isInteractive && (
        <button
          onClick={handleNext}
          className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
        >
          Skip step →
        </button>
      )}
    </div>
  )
}
