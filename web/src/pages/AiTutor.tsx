import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { usePageTitle } from '../hooks/usePageTitle'
import { supabase } from '../lib/supabase'

type Role = 'user' | 'assistant'
type Mode = 'explain' | 'quiz' | 'summarize' | 'deepdive'

interface Message {
  role: Role
  content: string
}

const MODES: { key: Mode; label: string }[] = [
  { key: 'explain', label: 'Explain 💡' },
  { key: 'quiz', label: 'Quiz Me ❓' },
  { key: 'summarize', label: 'Summarize 📋' },
  { key: 'deepdive', label: 'Deep Dive 🔬' },
]

const MODE_SYSTEM: Record<Mode, string> = {
  explain: 'You are a patient AI tutor. Explain the concept clearly with examples.',
  quiz: 'You are a quiz master. Ask me a question about the topic I provide, then evaluate my answer.',
  summarize: 'You are a concise summarizer. Summarize the key points of what I describe.',
  deepdive: 'You are an expert researcher. Give a comprehensive deep-dive explanation with advanced details.',
}

function CodeBlock({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const inner = part.slice(3, -3).replace(/^\w+\n/, '')
          return (
            <pre key={i} className="bg-gray-100 rounded-lg px-3 py-2 my-2 overflow-x-auto text-xs font-mono whitespace-pre-wrap">
              <code>{inner}</code>
            </pre>
          )
        }
        return <span key={i} className="whitespace-pre-wrap">{part}</span>
      })}
    </>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold flex-shrink-0">
        AI
      </div>
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
        <span className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  )
}

export default function AiTutor() {
  usePageTitle('AI Tutor')

  const [mode, setMode] = useState<Mode>('explain')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function sendMessage() {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('chat', {
        body: {
          messages: nextMessages,
          mode,
          systemPrompt: MODE_SYSTEM[mode],
        },
      })

      if (fnError) throw fnError

      const reply: string = data?.reply ?? 'No response received.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
      setMessages(prev => prev.slice(0, -1))
      setInput(trimmed)
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      sendMessage()
    }
  }

  function clearChat() {
    setMessages([])
    setError(null)
    setInput('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-1 flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900">AI Tutor</h1>
        <button
          onClick={clearChat}
          className="border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium"
        >
          Clear chat
        </button>
      </div>

      {/* Mode selector */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 flex-shrink-0">
        {MODES.map(m => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex-1 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === m.key
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-1 pb-2">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-2">
            <span className="text-4xl">🎓</span>
            <p className="text-sm font-medium text-gray-500">Ask me anything to get started</p>
            <p className="text-xs">Current mode: <span className="font-semibold text-green-600">{MODES.find(m => m.key === mode)?.label}</span></p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold flex-shrink-0">
                AI
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' ? (
                <CodeBlock content={msg.content} />
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}

        {isLoading && <TypingIndicator />}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-100 pt-4 pb-2">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Cmd+Enter to send)"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 ml-1">Cmd/Ctrl + Enter to send</p>
      </div>
    </div>
  )
}
