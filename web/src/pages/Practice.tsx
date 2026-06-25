import { useState } from 'react'
import { useAuth } from '../data/useAuth'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'

const MODELS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku — Fast & light' },
  { id: 'claude-sonnet-4-6', label: 'Sonnet — More capable' },
]

export default function Practice() {
  usePageTitle('AI Practice')
  const { user } = useAuth()
  const { success, error } = useToast()

  const [systemPrompt, setSystemPrompt] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [model, setModel] = useState(MODELS[0].id)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSystem, setShowSystem] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleRun() {
    if (!userPrompt.trim()) return
    setLoading(true)
    setOutput('')
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('chat', {
        body: {
          messages: [{ role: 'user', content: userPrompt }],
          ...(systemPrompt.trim() ? { systemPrompt: systemPrompt.trim() } : {}),
          model,
        },
      })
      if (invokeError) throw invokeError
      const text: string =
        data?.choices?.[0]?.message?.content ??
        data?.content?.[0]?.text ??
        data?.text ??
        'No response returned.'
      setOutput(text)
    } catch (err) {
      error('Failed to get a response. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveToPortfolio() {
    if (!output || !user) return
    setSaving(true)
    try {
      const { error: dbError } = await supabase.from('step_responses').insert({
        user_id: user.id,
        step_id: 'practice',
        lesson_id: null,
        response: { prompt: userPrompt, system: systemPrompt, model, text: output },
      })
      if (dbError) throw dbError
      success('Saved to Portfolio!')
    } catch {
      error('Could not save to portfolio.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Practice</h1>
        <p className="text-gray-500 mt-1">Write prompts and see how Claude responds. Outputs save to your Portfolio.</p>
      </div>

      {/* Input panel */}
      <Card>
        <div className="space-y-4">
          {/* Model selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Model</label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* System prompt toggle */}
          <div>
            <button
              onClick={() => setShowSystem(s => !s)}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
            >
              <span className={`transition-transform ${showSystem ? 'rotate-90' : ''}`}>▶</span>
              System prompt <span className="text-gray-400 font-normal">(optional)</span>
            </button>
            {showSystem && (
              <textarea
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                placeholder="You are a helpful AI expert. Be concise and practical."
                rows={3}
                className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
              />
            )}
          </div>

          {/* User prompt */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your prompt</label>
            <textarea
              value={userPrompt}
              onChange={e => setUserPrompt(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRun()
              }}
              placeholder="Write a prompt and press Run… (⌘↵ to run)"
              rows={5}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            onClick={handleRun}
            disabled={!userPrompt.trim() || loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl py-3 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating…
              </>
            ) : (
              '▶ Run prompt'
            )}
          </button>
        </div>
      </Card>

      {/* Output panel */}
      {(output || loading) && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 text-sm">Response</h2>
            {output && (
              <button
                onClick={handleSaveToPortfolio}
                disabled={saving}
                className="text-xs text-green-600 hover:text-green-700 font-medium border border-green-200 px-3 py-1 rounded-full hover:bg-green-50 transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving…' : '+ Save to Portfolio'}
              </button>
            )}
          </div>
          {loading ? (
            <div className="flex items-center gap-3 py-8 justify-center text-gray-400">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Thinking…</span>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{output}</p>
            </div>
          )}
        </Card>
      )}

      {/* Tips */}
      {!output && !loading && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">Prompt ideas to try</h2>
          <div className="space-y-2">
            {[
              'Explain the difference between zero-shot and few-shot prompting in simple terms.',
              'Write a system prompt for a customer support chatbot that sells software.',
              'What are 3 ways I can use AI to save time in my workday?',
            ].map(tip => (
              <button
                key={tip}
                onClick={() => setUserPrompt(tip)}
                className="w-full text-left text-sm text-gray-600 hover:text-green-700 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-green-100"
              >
                "{tip}"
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
