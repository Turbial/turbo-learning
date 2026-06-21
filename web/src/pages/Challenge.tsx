import { useEffect, useState } from 'react'
import { useDailyChallengeStore, getDailyQuestions, ChallengeQuestion } from '../store/dailyChallengeStore'

const LETTER = ['A', 'B', 'C', 'D']

function ScoreEmoji({ correct }: { correct: boolean }) {
  return <span className={`text-2xl ${correct ? 'opacity-100' : 'opacity-30'}`}>{correct ? '🟩' : '🟥'}</span>
}

export default function Challenge() {
  const store = useDailyChallengeStore()
  const [questions] = useState<ChallengeQuestion[]>(() => getDailyQuestions())
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro')
  const [localAnswers, setLocalAnswers] = useState<boolean[]>([])
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    store.resetIfNewDay()
    if (store.completed) setPhase('done')
  }, [])

  useEffect(() => {
    if (phase !== 'playing') return
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [phase])

  const current = questions[currentIdx]

  function handleStart() {
    setPhase('playing')
    setCurrentIdx(0)
    setLocalAnswers([])
    setTimer(0)
  }

  function handleSelect(idx: number) {
    if (selected !== null || showFeedback) return
    setSelected(idx)
    store.setAnswer(current.id, idx)
    setShowFeedback(true)

    const correct = idx === current.correct
    const newAnswers = [...localAnswers, correct]

    setTimeout(() => {
      setShowFeedback(false)
      setSelected(null)
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(i => i + 1)
        setLocalAnswers(newAnswers)
      } else {
        const score = newAnswers.filter(Boolean).length
        store.completeChallenge(score)
        setLocalAnswers(newAnswers)
        setPhase('done')
      }
    }, 1400)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  if (store.completed && phase !== 'playing') {
    const score = store.score
    const answers = Object.entries(store.answers)
    const timeSec = store.endTime && store.startTime ? Math.round((store.endTime - store.startTime) / 1000) : 0

    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">⚡</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Daily Challenge Complete!</h1>
          <p className="text-gray-500 mb-6">Come back tomorrow for a fresh set.</p>

          <div className="flex justify-center gap-2 mb-6">
            {(localAnswers.length > 0 ? localAnswers : Array(5).fill(score >= 3)).map((correct, i) => (
              <ScoreEmoji key={i} correct={correct} />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-3xl font-bold text-green-600">{score}/5</p>
              <p className="text-sm text-gray-500 mt-1">Score</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-3xl font-bold text-gray-900">{formatTime(timeSec)}</p>
              <p className="text-sm text-gray-500 mt-1">Time</p>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            {score === 5 ? '🏆 Perfect score! Incredible!' :
             score >= 4 ? '🌟 Great job!' :
             score >= 3 ? '👍 Not bad!' :
             '💪 Keep practicing!'}
          </p>
        </div>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-5xl mb-4">⚡</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Daily Challenge</h1>
          <p className="text-gray-500 mb-6">Test your AI knowledge with 5 questions. New questions every day!</p>

          <div className="flex justify-center gap-4 mb-8">
            {[
              { icon: '❓', label: '5 Questions' },
              { icon: '⏱️', label: 'Timed' },
              { icon: '🔥', label: 'Streak Bonus' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-gray-500 font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-semibold transition-colors"
          >
            Start Challenge
          </button>
        </div>
      </div>
    )
  }

  const isCorrect = selected === current.correct

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-900">Daily Challenge</h1>
        <span className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          ⏱ {formatTime(timer)}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mb-6">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i < currentIdx
                ? (localAnswers[i] ? 'bg-green-500' : 'bg-red-400')
                : i === currentIdx
                ? 'bg-green-400'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full mb-3 inline-block">
          Question {currentIdx + 1} of {questions.length}
        </span>
        <p className="text-lg font-semibold text-gray-900 leading-snug">{current.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {current.options.map((opt, i) => {
          let style = 'bg-white border border-gray-200 hover:border-green-400 hover:bg-green-50'
          if (showFeedback) {
            if (i === current.correct) style = 'bg-green-100 border-green-500 border-2'
            else if (i === selected && !isCorrect) style = 'bg-red-100 border-red-400 border-2'
            else style = 'bg-white border border-gray-200 opacity-60'
          } else if (selected === i) {
            style = 'bg-green-50 border-green-400 border-2'
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showFeedback}
              className={`w-full text-left rounded-xl p-4 flex items-center gap-3 transition-all ${style}`}
            >
              <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                {LETTER[i]}
              </span>
              <span className="text-gray-800 font-medium">{opt}</span>
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`mt-4 rounded-xl p-4 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <p className={`font-semibold mb-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
            {isCorrect ? '✓ Correct!' : '✗ Not quite'}
          </p>
          <p className="text-sm text-gray-600">{current.explanation}</p>
        </div>
      )}
    </div>
  )
}
