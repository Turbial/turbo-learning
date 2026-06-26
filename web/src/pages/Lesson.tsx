import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../data/useAuth'
import { useUnit, useCompleteLesson, useSaveNote } from '../data/queries'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { XpBurst } from '../components/ui/XpBurst'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

// ─── Lesson query ─────────────────────────────────────────────────────────────
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

// ─── Step types ───────────────────────────────────────────────────────────────
type Step = Record<string, unknown> & { type: string; id?: string; xp?: number }

function parseSteps(lesson: LessonRow | null | undefined): Step[] {
  if (!lesson) return []
  const raw = lesson.steps ?? lesson.content
  if (!raw) return []
  if (Array.isArray(raw)) return raw as Step[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as Step[] } catch { return [] }
  }
  return []
}

// ─── Step renderers ───────────────────────────────────────────────────────────

function StoryChapterRenderer({ step }: { step: Step }) {
  return (
    <div className="text-center py-4 space-y-2">
      {step.act && (
        <p className="text-xs font-semibold text-green-600 uppercase tracking-widest">
          {step.act as string}
        </p>
      )}
      <h2 className="text-2xl font-black text-gray-900">{step.title as string}</h2>
      {step.subtitle && (
        <p className="text-base text-gray-500">{step.subtitle as string}</p>
      )}
      {step.episode && (
        <span className="inline-block bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full mt-2">
          Episode {step.episode as number}
        </span>
      )}
    </div>
  )
}

const CHARACTER_CONFIG: Record<string, { color: string; emoji: string; label: string }> = {
  aria:     { color: 'bg-purple-100 border-purple-200', emoji: '🤖', label: 'Aria' },
  coach:    { color: 'bg-blue-100 border-blue-200',     emoji: '🧑‍🏫', label: 'Coach' },
  villain:  { color: 'bg-red-100 border-red-200',       emoji: '😈', label: 'Villain' },
  narrator: { color: 'bg-gray-100 border-gray-200',     emoji: '📖', label: 'Narrator' },
}

function StorySceneRenderer({ step }: { step: Step }) {
  const char = CHARACTER_CONFIG[step.character as string] ?? CHARACTER_CONFIG.narrator
  return (
    <div className={`rounded-2xl border-2 p-4 space-y-3 ${char.color}`}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{char.emoji}</span>
        <span className="font-bold text-gray-800 text-sm">{char.label}</span>
        {step.mood && (
          <span className="text-xs text-gray-500 capitalize">· {step.mood as string}</span>
        )}
      </div>
      <p className="text-gray-800 leading-relaxed whitespace-pre-line">{step.dialogue as string}</p>
    </div>
  )
}

function InfoRenderer({ step }: { step: Step }) {
  const body = (step.body ?? step.text ?? step.content ?? '') as string
  return (
    <div className="space-y-3">
      {step.title && <h2 className="text-xl font-bold text-gray-900">{step.title as string}</h2>}
      {body && <p className="text-gray-700 leading-relaxed whitespace-pre-line">{body}</p>}
    </div>
  )
}

function HighlightRenderer({ step }: { step: Step }) {
  const body = (step.body ?? '') as string
  const highlights = (step.highlights as string[] | undefined) ?? []
  let display = body
  highlights.forEach(h => {
    display = display.replaceAll(h, `__MARK__${h}__MARK__`)
  })
  return (
    <div className="space-y-3">
      {step.title && <h2 className="text-xl font-bold text-gray-900">{step.title as string}</h2>}
      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
        {display.split('__MARK__').map((part, i) =>
          highlights.includes(part)
            ? <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">{part}</mark>
            : <span key={i}>{part}</span>
        )}
      </p>
    </div>
  )
}

function McRenderer({ step, onAdvance }: { step: Step; onAdvance: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const correctIdx = (step.correct_index ?? step.correct ?? 0) as number
  const options = (step.options as string[] | undefined) ?? []
  const feedback = (step.feedback as string[] | undefined) ?? []

  function handleSelect(i: number) {
    if (selected !== null) return
    setSelected(i)
    timerRef.current = setTimeout(onAdvance, 1500)
  }

  const isCorrect = selected === correctIdx
  const feedbackText = selected !== null
    ? (isCorrect ? feedback[0] : feedback[1]) ?? (isCorrect ? '✓ Correct!' : `The answer is: ${options[correctIdx]}`)
    : null

  return (
    <div className="space-y-4">
      {step.question && <p className="text-lg font-semibold text-gray-900 leading-snug">{step.question as string}</p>}
      <div className="space-y-2">
        {options.map((opt, i) => {
          let cls = 'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors '
          if (selected === null) cls += 'border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-700'
          else if (i === correctIdx) cls += 'border-green-500 bg-green-50 text-green-700'
          else if (i === selected) cls += 'border-red-300 bg-red-50 text-red-600'
          else cls += 'border-gray-100 text-gray-400'
          return (
            <button key={i} onClick={() => handleSelect(i)} disabled={selected !== null} className={cls}>
              {opt}
            </button>
          )
        })}
      </div>
      {feedbackText && (
        <p className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>{feedbackText}</p>
      )}
    </div>
  )
}

function TfRenderer({ step, onAdvance }: { step: Step; onAdvance: () => void }) {
  const [selected, setSelected] = useState<boolean | null>(null)
  const correct = (step.answer ?? step.correct ?? true) as boolean
  const feedback = (step.feedback as string[] | undefined) ?? []

  function handleSelect(val: boolean) {
    if (selected !== null) return
    setSelected(val)
    setTimeout(onAdvance, 1500)
  }

  const isCorrect = selected === correct
  const feedbackText = selected !== null
    ? (isCorrect ? feedback[0] : feedback[1]) ?? (isCorrect ? '✓ Correct!' : `The answer is ${correct ? 'True' : 'False'}`)
    : null

  return (
    <div className="space-y-4">
      {step.question && <p className="text-lg font-semibold text-gray-900 leading-snug">{step.question as string}</p>}
      <div className="flex gap-3">
        {([true, false] as const).map(val => {
          let cls = 'flex-1 py-3 rounded-xl border font-semibold text-sm transition-colors '
          if (selected === null) cls += 'border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-700'
          else if (val === correct) cls += 'border-green-500 bg-green-50 text-green-700'
          else if (val === selected) cls += 'border-red-300 bg-red-50 text-red-600'
          else cls += 'border-gray-100 text-gray-400'
          return (
            <button key={String(val)} onClick={() => handleSelect(val)} disabled={selected !== null} className={cls}>
              {val ? 'True' : 'False'}
            </button>
          )
        })}
      </div>
      {feedbackText && (
        <p className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>{feedbackText}</p>
      )}
    </div>
  )
}

function FillBlankRenderer({ step, onAdvance }: { step: Step; onAdvance: () => void }) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const answer = (step.answer ?? '') as string
  const aliases = (step.aliases as string[] | undefined) ?? []
  const question = (step.question ?? step.sentence ?? '') as string
  const feedback = (step.feedback as string[] | undefined) ?? []

  function handleSubmit() {
    setSubmitted(true)
    setTimeout(onAdvance, 1800)
  }

  const trimmed = input.trim().toLowerCase()
  const isCorrect = submitted && (
    trimmed === answer.toLowerCase() || aliases.some(a => trimmed === a.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {question && <p className="text-lg font-semibold text-gray-900 leading-snug">{question}</p>}
      {!submitted ? (
        <>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && input.trim() && handleSubmit()}
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
        <div className="space-y-2">
          <p className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-orange-500'}`}>
            {isCorrect
              ? (feedback[0] ?? '✓ Correct!')
              : (feedback[1] ?? `Answer: ${answer}`)}
          </p>
        </div>
      )}
    </div>
  )
}

function MatchRenderer({ step, onAdvance }: { step: Step; onAdvance: () => void }) {
  const pairs = (step.pairs as Array<{ left: string; right: string }> | undefined) ?? []
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const rights = useRef(pairs.map((_, i) => i)).current
  const [shuffled] = useState(() => [...rights].sort(() => Math.random() - 0.5))
  const [rightMatches, setRightMatches] = useState<Record<number, number>>({})

  function handleRight(rightIdx: number) {
    if (selectedLeft === null) return
    const correctRight = selectedLeft
    const isCorrect = shuffled[rightIdx] === correctRight
    if (isCorrect) {
      const newMatched = new Set(matched).add(selectedLeft)
      setRightMatches(prev => ({ ...prev, [rightIdx]: selectedLeft }))
      setMatched(newMatched)
      setSelectedLeft(null)
      if (newMatched.size === pairs.length) setTimeout(onAdvance, 800)
    } else {
      setSelectedLeft(null)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-base font-semibold text-gray-900">Match each item on the left with its pair on the right.</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {pairs.map((p, i) => (
            <button
              key={i}
              onClick={() => !matched.has(i) && setSelectedLeft(i)}
              className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                matched.has(i)
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : selectedLeft === i
                  ? 'border-green-500 bg-green-100 text-green-800'
                  : 'border-gray-200 hover:border-green-300 text-gray-700'
              }`}
            >
              {p.left}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {shuffled.map((origIdx, i) => {
            const isMatched = Object.values(rightMatches).includes(origIdx)
            return (
              <button
                key={i}
                onClick={() => !isMatched && handleRight(i)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  isMatched
                    ? 'border-green-400 bg-green-50 text-green-700'
                    : selectedLeft !== null
                    ? 'border-gray-200 hover:border-green-300 text-gray-700 cursor-pointer'
                    : 'border-gray-200 text-gray-400 cursor-default'
                }`}
              >
                {pairs[origIdx].right}
              </button>
            )
          })}
        </div>
      </div>
      <p className="text-xs text-gray-400 text-center">
        {matched.size} / {pairs.length} matched
      </p>
    </div>
  )
}

function GoodFitRenderer({ step, onAdvance }: { step: Step; onAdvance: () => void }) {
  const [selected, setSelected] = useState<'good' | 'notideal' | null>(null)
  const correct = (step.correct ?? 'good') as 'good' | 'notideal'
  const feedback = (step.feedback as string[] | undefined) ?? []

  function handleSelect(val: 'good' | 'notideal') {
    if (selected) return
    setSelected(val)
    setTimeout(onAdvance, 1800)
  }

  const isCorrect = selected === correct
  const feedbackText = selected !== null
    ? (isCorrect ? feedback[0] : feedback[1]) ?? (isCorrect ? '✓ Correct!' : 'Not quite.')
    : null

  return (
    <div className="space-y-4">
      {step.question && <p className="text-base font-semibold text-gray-900 leading-snug">{step.question as string}</p>}
      <div className="flex gap-3">
        {(['good', 'notideal'] as const).map(val => {
          let cls = 'flex-1 py-3 px-4 rounded-xl border font-semibold text-sm transition-colors '
          if (!selected) cls += val === 'good'
            ? 'border-green-200 hover:bg-green-50 text-green-700'
            : 'border-orange-200 hover:bg-orange-50 text-orange-600'
          else if (val === correct) cls += 'border-green-500 bg-green-50 text-green-700'
          else if (val === selected) cls += 'border-red-300 bg-red-50 text-red-600'
          else cls += 'border-gray-100 text-gray-400'
          return (
            <button key={val} onClick={() => handleSelect(val)} disabled={!!selected} className={cls}>
              {val === 'good' ? '👍 Good fit' : '👎 Not ideal'}
            </button>
          )
        })}
      </div>
      {feedbackText && (
        <p className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>{feedbackText}</p>
      )}
    </div>
  )
}

function ReflectionRenderer({ step, onAnswered }: { step: Step; onAnswered: () => void }) {
  const questions = (step.questions as Array<{ id: string; prompt: string; placeholder?: string; minChars?: number }> | undefined) ?? []
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = questions.every(q =>
    (answers[q.id] ?? '').trim().length >= (q.minChars ?? 1)
  )

  function handleSubmit() {
    setSubmitted(true)
    setTimeout(onAnswered, 800)
  }

  return (
    <div className="space-y-5">
      {questions.map(q => (
        <div key={q.id} className="space-y-2">
          <p className="text-sm font-semibold text-gray-800">{q.prompt}</p>
          <textarea
            value={answers[q.id] ?? ''}
            onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
            placeholder={q.placeholder ?? 'Write your answer…'}
            rows={3}
            disabled={submitted}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
          />
          {q.minChars && (
            <p className="text-xs text-gray-400">{(answers[q.id] ?? '').trim().length} / {q.minChars} min chars</p>
          )}
        </div>
      ))}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full bg-green-600 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          Save reflection →
        </button>
      )}
      {submitted && <p className="text-sm text-green-600 font-medium text-center">✓ Reflection saved</p>}
    </div>
  )
}

function QuizRenderer({ step, onAdvance }: { step: Step; onAdvance: () => void }) {
  const questions = (step.questions as Array<{
    id: string; question: string; questionType?: string;
    options?: string[]; correct: number | boolean | string; feedback?: string[]
  }> | undefined) ?? []
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})

  const current = questions[qIdx]

  function handleAnswer(val: unknown) {
    setAnswers(prev => ({ ...prev, [current.id]: val }))
    setTimeout(() => {
      if (qIdx + 1 < questions.length) setQIdx(i => i + 1)
      else onAdvance()
    }, 1200)
  }

  if (!current) return null
  const answered = answers[current.id] !== undefined

  if (current.questionType === 'tf') {
    const correct = current.correct as boolean
    const selected = answers[current.id] as boolean | undefined
    const isCorrect = selected === correct
    const feedback = current.feedback ?? []
    return (
      <div className="space-y-4">
        <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Question {qIdx + 1} of {questions.length}</p>
        <p className="text-base font-semibold text-gray-900">{current.question}</p>
        <div className="flex gap-3">
          {([true, false] as const).map(val => {
            let cls = 'flex-1 py-3 rounded-xl border font-semibold text-sm transition-colors '
            if (!answered) cls += 'border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-700'
            else if (val === correct) cls += 'border-green-500 bg-green-50 text-green-700'
            else if (val === selected) cls += 'border-red-300 bg-red-50 text-red-600'
            else cls += 'border-gray-100 text-gray-400'
            return <button key={String(val)} onClick={() => !answered && handleAnswer(val)} disabled={answered} className={cls}>{val ? 'True' : 'False'}</button>
          })}
        </div>
        {answered && <p className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>{isCorrect ? feedback[0] : feedback[1]}</p>}
      </div>
    )
  }

  if (current.questionType === 'fillblank') {
    const [input, setInput] = useState('')
    const answer = current.correct as string
    const isCorrect = answered && input.trim().toLowerCase() === answer.toLowerCase()
    const feedback = current.feedback ?? []
    return (
      <div className="space-y-4">
        <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Question {qIdx + 1} of {questions.length}</p>
        <p className="text-base font-semibold text-gray-900">{current.question}</p>
        {!answered ? (
          <>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && input.trim() && handleAnswer(input)}
              placeholder="Type your answer…" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <button onClick={() => input.trim() && handleAnswer(input)} disabled={!input.trim()}
              className="w-full bg-green-600 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors">Submit</button>
          </>
        ) : (
          <p className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-orange-500'}`}>{isCorrect ? feedback[0] : feedback[1] ?? `Answer: ${answer}`}</p>
        )}
      </div>
    )
  }

  // Default: MC
  const correctIdx = current.correct as number
  const options = current.options ?? []
  const selected = answers[current.id] as number | undefined
  const isCorrect = selected === correctIdx
  const feedback = current.feedback ?? []
  return (
    <div className="space-y-4">
      <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Question {qIdx + 1} of {questions.length}</p>
      <p className="text-base font-semibold text-gray-900">{current.question}</p>
      <div className="space-y-2">
        {options.map((opt: string, i: number) => {
          let cls = 'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors '
          if (!answered) cls += 'border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-700'
          else if (i === correctIdx) cls += 'border-green-500 bg-green-50 text-green-700'
          else if (i === selected) cls += 'border-red-300 bg-red-50 text-red-600'
          else cls += 'border-gray-100 text-gray-400'
          return <button key={i} onClick={() => !answered && handleAnswer(i)} disabled={answered} className={cls}>{opt}</button>
        })}
      </div>
      {answered && <p className={`text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-500'}`}>{isCorrect ? feedback[0] : feedback[1]}</p>}
    </div>
  )
}

function BuilderRenderer({ step, onAnswered }: { step: Step; onAnswered: () => void }) {
  const fields = (step.fields as Array<{ id: string; label: string; placeholder?: string }> | undefined) ?? []
  const template = (step.template as string | undefined) ?? ''
  const [values, setValues] = useState<Record<string, string>>({})
  const [result, setResult] = useState<string | null>(null)

  const allFilled = fields.every(f => (values[f.id] ?? '').trim().length > 0)

  function handleBuild() {
    let output = template
    Object.entries(values).forEach(([k, v]) => {
      output = output.replaceAll(`{${k}}`, v).replaceAll(`{{${k}}}`, v)
    })
    setResult(output)
    setTimeout(onAnswered, 500)
  }

  if (result) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-semibold text-green-700">✓ Your prompt is ready:</p>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{result}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {step.title && <h3 className="font-semibold text-gray-900">{step.title as string}</h3>}
      {fields.map(f => (
        <div key={f.id} className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{f.label}</label>
          <input
            value={values[f.id] ?? ''}
            onChange={e => setValues(prev => ({ ...prev, [f.id]: e.target.value }))}
            placeholder={f.placeholder}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      ))}
      <button
        onClick={handleBuild}
        disabled={!allFilled}
        className="w-full bg-green-600 text-white rounded-xl py-2.5 font-semibold text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        Build prompt →
      </button>
    </div>
  )
}

function CompletionRenderer({ step }: { step: Step }) {
  const body = (step.body ?? '') as string
  return (
    <div className="text-center space-y-3 py-2">
      <div className="text-4xl">🎯</div>
      {step.title && <h2 className="text-xl font-bold text-gray-900">{step.title as string}</h2>}
      {body && <p className="text-gray-600 leading-relaxed">{body}</p>}
    </div>
  )
}

function GenericRenderer({ step }: { step: Step }) {
  const body = (step.body ?? step.text ?? step.content ?? step.dialogue ?? step.prompt ?? '') as string
  const title = (step.title ?? '') as string
  return (
    <div className="space-y-3">
      {title && <h2 className="text-xl font-bold text-gray-900">{title}</h2>}
      {body && <p className="text-gray-700 leading-relaxed whitespace-pre-line">{body}</p>}
      {!title && !body && <p className="text-gray-500 text-sm italic">Continue to the next step.</p>}
    </div>
  )
}

// ─── Fallback when no lesson in DB ────────────────────────────────────────────
function getFallbackCards(unit: { title?: string; goal?: string } | undefined) {
  return [
    { title: unit?.title ?? 'Lesson Overview', body: unit?.goal ?? 'In this lesson you will explore key concepts and build practical skills.' },
    { title: 'Key Takeaways', body: 'Focus on understanding the core ideas. Apply them in real situations as you encounter them.' },
    { title: 'Keep It Up!', body: 'Consistent practice is how skills are built. Come back tomorrow to reinforce what you learned today.' },
  ]
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Lesson() {
  const { unitId } = useParams<{ unitId: string }>()
  const { user: _user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const completeLesson = useCompleteLesson()
  const saveNote = useSaveNote()

  const [phase, setPhase] = useState<'intro' | 'playing' | 'complete'>('intro')
  const [stepIdx, setStepIdx] = useState(0)
  const [completing, setCompleting] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)

  const { data: unit, isLoading: unitLoading } = useUnit(unitId)
  const { data: lesson, isLoading: lessonLoading } = useLessonSteps(unitId)

  usePageTitle(unit?.title ?? 'Lesson')

  const LESSON_XP = 50
  const rawSteps = parseSteps(lesson)
  const useFallback = rawSteps.length === 0
  const fallbackCards = getFallbackCards(unit)
  const totalSteps = useFallback ? fallbackCards.length : rawSteps.length

  async function handleComplete() {
    setCompleting(true)
    try {
      if (lesson?.id) {
        await completeLesson.mutateAsync({ lessonId: lesson.id, xpEarned: LESSON_XP, score: 100 })
      }
      setPhase('complete')
    } catch (err) {
      console.error('Failed to complete lesson:', err)
      toast.error('Failed to save progress. Please try again.')
    } finally {
      setCompleting(false)
    }
  }

  function handleNext() {
    if (stepIdx + 1 >= totalSteps) handleComplete()
    else setStepIdx(i => i + 1)
  }

  async function handleSaveNote() {
    if (!noteText.trim()) return
    try {
      await saveNote.mutateAsync({ unitId, content: noteText.trim() })
      setNoteSaved(true)
      setNoteText('')
      setTimeout(() => { setNoteSaved(false); setNoteOpen(false) }, 1500)
    } catch {
      toast.error('Could not save note. Try again.')
    }
  }

  // ── Complete ──
  if (phase === 'complete') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lesson Complete!</h1>
          <p className="text-gray-500 mb-2">{unit?.title ?? 'Lesson'}</p>
          <div className="mb-6"><XpBurst xp={LESSON_XP} /></div>
          <div className="space-y-3">
            <button onClick={() => navigate('/')} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-semibold transition-colors">
              Back to Journey
            </button>
            <button onClick={() => navigate('/dashboard')} className="w-full border border-gray-200 text-gray-700 rounded-xl py-3 font-medium hover:bg-gray-50 transition-colors">
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Intro ──
  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          ← Back to Journey
        </button>
        {unitLoading || lessonLoading ? (
          <Card><Skeleton className="h-14 w-14 rounded-2xl mb-4" /><Skeleton lines={3} /></Card>
        ) : (
          <>
            <Card>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                  {(unit as Record<string, unknown>)?.emoji as string ?? '📖'}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-600 mb-1 uppercase tracking-wide">Today's Lesson</p>
                  <h1 className="text-xl font-bold text-gray-900 mb-1">{unit?.title ?? `Lesson ${unitId?.slice(-4)}`}</h1>
                  {unit?.goal && <p className="text-sm text-gray-500">{unit.goal}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">+{LESSON_XP} XP</span>
                    <span className="text-xs text-gray-400">{totalSteps} steps</span>
                    <span className="text-xs text-gray-400">~{Math.max(5, totalSteps)} min</span>
                  </div>
                </div>
              </div>
            </Card>
            <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white text-center">
              <p className="text-white/80 text-sm mb-1">Ready to learn?</p>
              <h2 className="text-xl font-bold mb-4">Start this lesson</h2>
              <button onClick={() => setPhase('playing')} className="bg-white text-green-700 hover:bg-green-50 rounded-xl px-8 py-3 font-bold text-sm transition-colors">
                Begin Lesson →
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Playing ──
  const progress = ((stepIdx + 1) / totalSteps) * 100
  const currentStep = useFallback ? null : rawSteps[stepIdx]

  // Interactive = auto-advances on answer, no "Next" button needed
  const isInteractive = !useFallback && currentStep && [
    'mc', 'tf', 'fillblank', 'fill_blank', 'match', 'good_fit', 'quiz',
  ].includes(currentStep.type)

  // Answerable = has its own submit, still needs "Next" after
  const isAnswerable = !useFallback && currentStep && [
    'reflection', 'builder',
  ].includes(currentStep.type)

  function renderStep() {
    if (useFallback) {
      const card = fallbackCards[stepIdx]
      return <div className="space-y-4"><h2 className="text-xl font-bold text-gray-900">{card.title}</h2><p className="text-gray-700 leading-relaxed">{card.body}</p></div>
    }
    if (!currentStep) return null

    switch (currentStep.type) {
      case 'story_chapter':   return <StoryChapterRenderer step={currentStep} />
      case 'story_scene':     return <StorySceneRenderer step={currentStep} />
      case 'info':
      case 'example':
      case 'scenario_card':   return <InfoRenderer step={currentStep} />
      case 'highlight':       return <HighlightRenderer step={currentStep} />
      case 'mc':              return <McRenderer step={currentStep} onAdvance={handleNext} />
      case 'tf':              return <TfRenderer step={currentStep} onAdvance={handleNext} />
      case 'fillblank':
      case 'fill_blank':      return <FillBlankRenderer step={currentStep} onAdvance={handleNext} />
      case 'match':           return <MatchRenderer step={currentStep} onAdvance={handleNext} />
      case 'good_fit':        return <GoodFitRenderer step={currentStep} onAdvance={handleNext} />
      case 'quiz':            return <QuizRenderer step={currentStep} onAdvance={handleNext} />
      case 'reflection':      return <ReflectionRenderer step={currentStep} onAnswered={handleNext} />
      case 'builder':         return <BuilderRenderer step={currentStep} onAnswered={handleNext} />
      case 'completion':      return <CompletionRenderer step={currentStep} />
      default:                return <GenericRenderer step={currentStep} />
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 relative pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => setPhase('intro')} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
        <span className="text-sm font-medium text-gray-500">Step {stepIdx + 1} of {totalSteps}</span>
      </div>

      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-green-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <Card>
        <p className="text-xs font-medium text-green-600 mb-4 uppercase tracking-wide">{unit?.title ?? 'Lesson'}</p>
        {renderStep()}
      </Card>

      {/* Next button: show for non-interactive, non-answerable steps */}
      {!isInteractive && !isAnswerable && (
        <button
          onClick={handleNext}
          disabled={completing}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl py-3 font-semibold transition-colors"
        >
          {completing ? 'Saving…' : stepIdx + 1 >= totalSteps ? 'Complete Lesson ✓' : 'Next →'}
        </button>
      )}

      {/* Skip for interactive steps */}
      {isInteractive && (
        <button onClick={handleNext} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">
          Skip →
        </button>
      )}

      {/* Floating note button */}
      <button
        onClick={() => { setNoteOpen(o => !o); setNoteSaved(false) }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 bg-yellow-400 hover:bg-yellow-500 rounded-full shadow-lg flex items-center justify-center text-xl transition-all z-30"
        aria-label="Take a note"
      >
        📝
      </button>

      {noteOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-2xl md:left-60">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm">📝 Add a note</h3>
              <button onClick={() => setNoteOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
            </div>
            {noteSaved ? (
              <p className="text-green-600 font-medium text-sm py-3 text-center">✓ Note saved!</p>
            ) : (
              <>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Write your note…"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-2"
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{noteText.length}/500</span>
                  <button
                    onClick={handleSaveNote}
                    disabled={!noteText.trim() || saveNote.isPending}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-sm font-semibold px-4 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {saveNote.isPending ? 'Saving…' : 'Save note'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
