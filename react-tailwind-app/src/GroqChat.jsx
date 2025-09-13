import { useMemo, useRef, useState } from 'react'
import OpenAI from 'openai'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const DEFAULT_MODEL = 'openai/gpt-oss-20b'

export default function GroqChat() {
  const [prompt, setPrompt] = useState('Explain Tailwind CSS in one paragraph.')
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [html, setHtml] = useState('')
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const streamRef = useRef(null)

  const client = useMemo(() => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY
    return new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
      dangerouslyAllowBrowser: true,
    })
  }, [])

  function extractDeltaText(payload) {
    if (typeof payload === 'string') return payload
    if (!payload) return ''
    if (typeof payload.delta === 'string') return payload.delta
    if (typeof payload.text === 'string') return payload.text
    if (typeof payload.data === 'string') return payload.data
    if (typeof payload.value === 'string') return payload.value
    return ''
  }

  async function sendPrompt(e) {
    e?.preventDefault()
    setError('')
    setHtml('')
    setRawText('')
    if (!prompt.trim()) return
    setLoading(true)
    try {
      // If a previous stream is running, stop it
      try { streamRef.current?.abort?.() } catch {}

      const stream = await client.responses.stream({
        model,
        input: prompt.trim(),
      })
      streamRef.current = stream

      // Primary: Responses API text stream
      stream.on('response.output_text.delta', (delta) => {
        setRawText((prev) => {
          const piece = extractDeltaText(delta)
          const next = prev + (piece || '')
          const dirty = marked.parse(next)
          const clean = DOMPurify.sanitize(dirty)
          setHtml(clean)
          return next
        })
      })

      // Fallback: some SDK versions emit 'text.delta'
      stream.on?.('text.delta', (delta) => {
        setRawText((prev) => {
          const piece = extractDeltaText(delta)
          const next = prev + (piece || '')
          const dirty = marked.parse(next)
          const clean = DOMPurify.sanitize(dirty)
          setHtml(clean)
          return next
        })
      })

      // Generic message event fallback
      stream.on?.('message', (event) => {
        try {
          const type = event?.type || event?.event || ''
          if (type === 'response.output_text.delta' || type === 'text.delta') {
            const piece = extractDeltaText(event)
            if (piece) {
              setRawText((prev) => {
                const next = prev + piece
                const dirty = marked.parse(next)
                const clean = DOMPurify.sanitize(dirty)
                setHtml(clean)
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
        // Ensure final render using snapshot
        const text = res?.output_text ?? ''
        if (text && text !== rawText) {
          const dirty = marked.parse(text)
          const clean = DOMPurify.sanitize(dirty)
          setHtml(clean)
          setRawText(text)
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

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <form onSubmit={sendPrompt} className="space-y-3">
        <label className="block">
          <span className="block text-sm font-medium text-slate-700">Model</span>
          <select
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="openai/gpt-oss-20b">openai/gpt-oss-20b</option>
            <option value="openai/gpt-oss-120b">openai/gpt-oss-120b</option>
          </select>
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-slate-700">Prompt</span>
          <textarea
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask something..."
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Streaming…' : 'Send'}
          </button>
          {loading && (
            <button
              type="button"
              onClick={stopStream}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Stop
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() => { setPrompt(''); setHtml(''); setRawText(''); setError('') }}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Render Markdown as HTML */}
      <div className="max-w-none text-slate-800">
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}
