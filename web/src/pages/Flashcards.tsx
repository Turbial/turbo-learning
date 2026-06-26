import { useState } from 'react'
import { useAuth } from '../data/useAuth'
import { supabase } from '../lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

// ── Types ────────────────────────────────────────────────────────────────────

interface Deck {
  id: string
  user_id: string
  title: string
  description: string
  card_count: number
}

interface Flashcard {
  id: string
  deck_id: string
  front: string
  back: string
}

interface FlashcardReview {
  id: string
  user_id: string
  card_id: string
  ease_factor: number
  interval_days: number
  due_date: string
  reps: number
  lapses: number
}

type View = 'list' | 'detail' | 'study'
type Rating = 'again' | 'hard' | 'easy'

// ── SM-2 helpers ─────────────────────────────────────────────────────────────

function sm2(review: Partial<FlashcardReview>, rating: Rating) {
  const ef = review.ease_factor ?? 2.5
  const interval = review.interval_days ?? 1
  const reps = review.reps ?? 0
  const lapses = review.lapses ?? 0

  let newEf = ef
  let newInterval = interval
  let newReps = reps
  let newLapses = lapses

  if (rating === 'again') {
    newInterval = 1
    newEf = Math.max(1.3, ef - 0.2)
    newLapses = lapses + 1
  } else if (rating === 'hard') {
    newInterval = Math.max(1, Math.round(interval * 1.2))
    newEf = Math.max(1.3, ef - 0.15)
  } else {
    newInterval = Math.round(interval * ef)
    newEf = Math.min(2.5, ef + 0.1)
    newReps = reps + 1
  }

  const due = new Date()
  due.setDate(due.getDate() + newInterval)
  const dueDate = due.toISOString().split('T')[0]

  return { ease_factor: newEf, interval_days: newInterval, due_date: dueDate, reps: newReps, lapses: newLapses }
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Flashcards() {
  usePageTitle('Flashcards')
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  const [view, setView] = useState<View>('list')
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newDeckTitle, setNewDeckTitle] = useState('')
  const [newDeckDesc, setNewDeckDesc] = useState('')
  const [showAddCard, setShowAddCard] = useState(false)
  const [newFront, setNewFront] = useState('')
  const [newBack, setNewBack] = useState('')

  // Study state
  const [studyCards, setStudyCards] = useState<Flashcard[]>([])
  const [studyIndex, setStudyIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [studyDone, setStudyDone] = useState(false)
  const [sessionTotal, setSessionTotal] = useState(0)

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: decks = [], isLoading: decksLoading } = useQuery({
    queryKey: ['flashcard_decks', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error: err } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (err) throw err
      return data as Deck[]
    },
    enabled: !!user,
  })

  const { data: dueCounts = {} } = useQuery({
    queryKey: ['due_counts', user?.id],
    queryFn: async () => {
      if (!user) return {}
      const { data, error: err } = await supabase
        .from('flashcard_reviews')
        .select('card_id, due_date, flashcards!inner(deck_id)')
        .eq('user_id', user.id)
        .lte('due_date', todayStr())
      if (err) throw err
      const counts: Record<string, number> = {}
      for (const row of data ?? []) {
        const deckId = (row as any).flashcards?.deck_id
        if (deckId) counts[deckId] = (counts[deckId] ?? 0) + 1
      }
      return counts
    },
    enabled: !!user,
  })

  const { data: deckCards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['flashcards', selectedDeck?.id],
    queryFn: async () => {
      if (!selectedDeck) return []
      const { data, error: err } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', selectedDeck.id)
        .order('created_at', { ascending: true })
      if (err) throw err
      return data as Flashcard[]
    },
    enabled: !!selectedDeck,
  })

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createDeck = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      const { error: err } = await supabase
        .from('flashcard_decks')
        .insert({ user_id: user!.id, title, description, card_count: 0 })
      if (err) throw err
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard_decks', user?.id] })
      setNewDeckTitle('')
      setNewDeckDesc('')
      setShowCreateForm(false)
      success('Deck created!')
    },
    onError: () => error('Could not create deck.'),
  })

  const addCard = useMutation({
    mutationFn: async ({ front, back }: { front: string; back: string }) => {
      const { error: err } = await supabase
        .from('flashcards')
        .insert({ deck_id: selectedDeck!.id, front, back })
      if (err) throw err
      await supabase
        .from('flashcard_decks')
        .update({ card_count: (selectedDeck!.card_count ?? 0) + 1 })
        .eq('id', selectedDeck!.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', selectedDeck?.id] })
      queryClient.invalidateQueries({ queryKey: ['flashcard_decks', user?.id] })
      setNewFront('')
      setNewBack('')
      setShowAddCard(false)
      success('Card added!')
    },
    onError: () => error('Could not add card.'),
  })

  const deleteCard = useMutation({
    mutationFn: async (cardId: string) => {
      const { error: err } = await supabase.from('flashcards').delete().eq('id', cardId)
      if (err) throw err
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', selectedDeck?.id] })
      queryClient.invalidateQueries({ queryKey: ['flashcard_decks', user?.id] })
      success('Card deleted.')
    },
    onError: () => error('Could not delete card.'),
  })

  const submitReview = useMutation({
    mutationFn: async ({ cardId, updates }: { cardId: string; updates: ReturnType<typeof sm2> }) => {
      const { error: err } = await supabase
        .from('flashcard_reviews')
        .upsert(
          { user_id: user!.id, card_id: cardId, ...updates },
          { onConflict: 'user_id,card_id' }
        )
      if (err) throw err
    },
  })

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function startStudy(deck: Deck) {
    const { data: cards } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deck.id)
    if (!cards || cards.length === 0) {
      error('No cards in this deck yet.')
      return
    }

    // Get reviews to know which are due
    const { data: reviews } = await supabase
      .from('flashcard_reviews')
      .select('*')
      .eq('user_id', user!.id)
      .in('card_id', cards.map((c: Flashcard) => c.id))

    const reviewMap: Record<string, FlashcardReview> = {}
    for (const r of reviews ?? []) reviewMap[r.card_id] = r

    const today = todayStr()
    const due = cards.filter((c: Flashcard) => {
      const r = reviewMap[c.id]
      return !r || r.due_date <= today
    })

    if (due.length === 0) {
      error('No cards due for review today!')
      return
    }

    setStudyCards(due)
    setStudyIndex(0)
    setFlipped(false)
    setStudyDone(false)
    setSessionTotal(due.length)
    setSelectedDeck(deck)
    setView('study')
  }

  async function handleRating(rating: Rating) {
    const card = studyCards[studyIndex]
    const { data: existing } = await supabase
      .from('flashcard_reviews')
      .select('*')
      .eq('user_id', user!.id)
      .eq('card_id', card.id)
      .maybeSingle()

    const updates = sm2(existing ?? {}, rating)
    await submitReview.mutateAsync({ cardId: card.id, updates })

    if (studyIndex + 1 >= studyCards.length) {
      setStudyDone(true)
    } else {
      setStudyIndex(i => i + 1)
      setFlipped(false)
    }
  }

  function openDeck(deck: Deck) {
    setSelectedDeck(deck)
    setView('detail')
  }

  function goBack() {
    setView('list')
    setSelectedDeck(null)
    setShowAddCard(false)
  }

  // ── Render: Study View ─────────────────────────────────────────────────────

  if (view === 'study') {
    if (studyDone) {
      return (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <div className="text-center py-10">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Complete!</h2>
              <p className="text-gray-500 mb-6">You reviewed {sessionTotal} card{sessionTotal !== 1 ? 's' : ''}.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setView('detail'); setStudyDone(false) }}
                  className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium"
                >
                  Back to Deck
                </button>
                <button
                  onClick={() => startStudy(selectedDeck!)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                >
                  Study Again
                </button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    const card = studyCards[studyIndex]
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setView('detail'); setStudyDone(false) }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Exit Study
          </button>
          <span className="text-sm text-gray-500">{studyIndex + 1} / {studyCards.length}</span>
        </div>

        <ProgressBar value={studyIndex} max={studyCards.length} label="Session progress" showPercent />

        <Card>
          <div className="min-h-48 flex flex-col items-center justify-center text-center py-8 gap-4">
            {!flipped ? (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Front</p>
                <p className="text-2xl font-bold text-gray-900">{card.front}</p>
                <button
                  onClick={() => setFlipped(true)}
                  className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                >
                  Flip
                </button>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Front</p>
                <p className="text-base text-gray-500">{card.front}</p>
                <div className="w-full border-t border-gray-100 my-3" />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Back</p>
                <p className="text-2xl font-bold text-gray-900">{card.back}</p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleRating('again')}
                    disabled={submitReview.isPending}
                    className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-xl text-sm font-medium"
                  >
                    Again 😞
                  </button>
                  <button
                    onClick={() => handleRating('hard')}
                    disabled={submitReview.isPending}
                    className="bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-xl text-sm font-medium"
                  >
                    Hard 🤔
                  </button>
                  <button
                    onClick={() => handleRating('easy')}
                    disabled={submitReview.isPending}
                    className="bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 px-4 py-2 rounded-xl text-sm font-medium"
                  >
                    Easy ✓
                  </button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    )
  }

  // ── Render: Deck Detail View ───────────────────────────────────────────────

  if (view === 'detail' && selectedDeck) {
    const dueCount = dueCounts[selectedDeck.id] ?? 0
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={goBack} className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Decks
          </button>
          <button
            onClick={() => startStudy(selectedDeck)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
          >
            Study Now
            {dueCount > 0 && (
              <span className="bg-white text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {dueCount}
              </span>
            )}
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{selectedDeck.title}</h1>
          {selectedDeck.description && (
            <p className="text-gray-500 mt-1">{selectedDeck.description}</p>
          )}
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Cards ({selectedDeck.card_count})</h2>
            <button
              onClick={() => setShowAddCard(v => !v)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              {showAddCard ? 'Cancel' : '+ Add Card'}
            </button>
          </div>

          {showAddCard && (
            <div className="mb-6 space-y-3 bg-gray-50 rounded-xl p-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Front</label>
                <textarea
                  value={newFront}
                  onChange={e => setNewFront(e.target.value)}
                  placeholder="Question or term..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Back</label>
                <textarea
                  value={newBack}
                  onChange={e => setNewBack(e.target.value)}
                  placeholder="Answer or definition..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
              <button
                onClick={() => {
                  if (!newFront.trim() || !newBack.trim()) return
                  addCard.mutate({ front: newFront.trim(), back: newBack.trim() })
                }}
                disabled={addCard.isPending || !newFront.trim() || !newBack.trim()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {addCard.isPending ? 'Saving...' : 'Save Card'}
              </button>
            </div>
          )}

          {cardsLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : deckCards.length === 0 ? (
            <EmptyState icon="🃏" title="No cards yet" description="Add your first card above to get started." />
          ) : (
            <div className="divide-y divide-gray-100">
              {deckCards.map(card => (
                <div key={card.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{card.front}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{card.back}</p>
                  </div>
                  <button
                    onClick={() => deleteCard.mutate(card.id)}
                    disabled={deleteCard.isPending}
                    className="text-xs text-red-400 hover:text-red-600 flex-shrink-0 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    )
  }

  // ── Render: Deck List View ─────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
          <p className="text-gray-500 mt-1">Spaced repetition for lasting memory.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(v => !v)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          {showCreateForm ? 'Cancel' : '+ New Deck'}
        </button>
      </div>

      {showCreateForm && (
        <Card>
          <h2 className="font-bold text-gray-900 mb-4">Create Deck</h2>
          <div className="space-y-3">
            <input
              type="text"
              value={newDeckTitle}
              onChange={e => setNewDeckTitle(e.target.value)}
              placeholder="Deck title"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
            <input
              type="text"
              value={newDeckDesc}
              onChange={e => setNewDeckDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
            <button
              onClick={() => {
                if (!newDeckTitle.trim()) return
                createDeck.mutate({ title: newDeckTitle.trim(), description: newDeckDesc.trim() })
              }}
              disabled={createDeck.isPending || !newDeckTitle.trim()}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {createDeck.isPending ? 'Creating...' : 'Create Deck'}
            </button>
          </div>
        </Card>
      )}

      {decksLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      ) : decks.length === 0 ? (
        <EmptyState
          icon="🃏"
          title="No decks yet"
          description="Create your first deck to start studying with spaced repetition."
        />
      ) : (
        <div className="space-y-3">
          {decks.map(deck => {
            const dueCount = dueCounts[deck.id] ?? 0
            return (
              <Card key={deck.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => openDeck(deck)}>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{deck.title}</h3>
                      {dueCount > 0 && (
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                          {dueCount} due
                        </span>
                      )}
                    </div>
                    {deck.description && (
                      <p className="text-sm text-gray-500 truncate">{deck.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{deck.card_count} card{deck.card_count !== 1 ? 's' : ''}</p>
                  </div>
                  <button
                    onClick={() => startStudy(deck)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl font-semibold text-xs transition-colors flex-shrink-0"
                  >
                    Study
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
