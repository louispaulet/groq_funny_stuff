import { useEffect, useMemo, useRef, useState } from 'react'
import OpenAI from 'openai'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const DEFAULT_MODEL = 'openai/gpt-oss-20b'

export default function GroqChat() {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! Ask me anything.' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const streamRef = useRef(null)
  const bottomRef = useRef(null)

  const client = useMemo(() => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY
    return new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
      dangerouslyAllowBrowser: true,
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  function extractDeltaText(payload) {
    if (typeof payload === 'string') return payload
    if (!payload) return ''
    if (typeof payload.delta === 'string') return payload.delta
    if (typeof payload.text === 'string') return payload.text
    if (typeof payload.data === 'string') return payload.data
    if (typeof payload.value === 'string') return payload.value
    return ''
  }

  function buildInputFromMessages(history) {
    const header = 'You are a helpful AI assistant.'
    const convo = history
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n')
    return `${header}\n\n${convo}\nAssistant:`
  }

  async function sendPrompt(e) {
    e?.preventDefault()
    setError('')
    if (!prompt.trim()) return
    setLoading(true)
    try {
      // If a previous stream is running, stop it
      try { streamRef.current?.abort?.() } catch {}

      const userMsg = { role: 'user', content: prompt.trim() }
      const history = [...messages, userMsg]
      // Optimistically update UI with user and empty assistant placeholder
      setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }])
      setPrompt('')

      const stream = await client.responses.stream({
        model,
        input: buildInputFromMessages(history),
      })
      streamRef.current = stream

      // Primary: Responses API text stream
      stream.on('response.output_text.delta', (delta) => {
        const piece = extractDeltaText(delta)
        if (piece) {
          setMessages(prev => {
            const next = [...prev]
            const i = next.length - 1
            if (i >= 0 && next[i].role === 'assistant') {
              next[i] = { ...next[i], content: next[i].content + piece }
            }
            return next
          })
        }
      })

      // Fallback: some SDK versions emit 'text.delta'
      stream.on?.('text.delta', (delta) => {
        const piece = extractDeltaText(delta)
        if (piece) {
          setMessages(prev => {
            const next = [...prev]
            const i = next.length - 1
            if (i >= 0 && next[i].role === 'assistant') {
              next[i] = { ...next[i], content: next[i].content + piece }
            }
            return next
          })
        }
      })

      // Generic message event fallback
      stream.on?.('message', (event) => {
        try {
          const type = event?.type || event?.event || ''
          if (type === 'response.output_text.delta' || type === 'text.delta') {
            const piece = extractDeltaText(event)
            if (piece) {
              setMessages(prev => {
                const next = [...prev]
                const i = next.length - 1
                if (i >= 0 && next[i].role === 'assistant') {
                  next[i] = { ...next[i], content: next[i].content + piece }
                }
                return next
              })
            }
          }
        } catch {}
      })

      stream.on('error', (err) => {
        setError(err?.message || String(err))
      })

      stream.on?.('response.completed', (res) => {
        // Optionally ensure final snapshot matches accumulated text
        const text = res?.output_text ?? ''
        if (text) {
          setMessages(prev => {
            const next = [...prev]
            const i = next.length - 1
            if (i >= 0 && next[i].role === 'assistant') {
              next[i] = { ...next[i], content: text }
            }
            return next
          })
        }
      })

      await stream.done()
    } catch (err) {
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
      streamRef.current = null
    }
  }

  function stopStream() {
    try { streamRef.current?.abort?.() } catch {}
    streamRef.current = null
    setLoading(false)
  }

  function renderAssistant(content) {
    const dirty = marked.parse(content || '')
    const clean = DOMPurify.sanitize(dirty)
    return { __html: clean }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="flex items-center gap-3">
        <label className="block w-64">
          <span className="block text-xs font-medium text-slate-600">Model</span>
          <select
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="openai/gpt-oss-20b">openai/gpt-oss-20b</option>
            <option value="openai/gpt-oss-120b">openai/gpt-oss-120b</option>
          </select>
        </label>
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
        )}
      </div>

      <div className="h-[60vh] overflow-y-auto rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[80%] rounded-2xl bg-indigo-600 px-4 py-2 text-sm text-white shadow'
                    : 'max-w-[80%] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800 shadow-sm'
                }
              >
                {m.role === 'assistant' ? (
                  // eslint-disable-next-line react/no-danger
                  <div dangerouslySetInnerHTML={renderAssistant(m.content)} />
                ) : (
                  <div className="whitespace-pre-wrap">{m.content}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={sendPrompt} className="flex items-end gap-2">
        <textarea
          className="block w-full rounded-md border border-slate-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={2}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type a message (Shift+Enter for newline)"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!loading) sendPrompt(e);
            }
          }}
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Streaming…' : 'Send'}
          </button>
          {loading ? (
            <button
              type="button"
              onClick={stopStream}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMessages([{ role: 'assistant', content: 'Hi! Ask me anything.' }])}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
