import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline'
import { readImageHistory, writeImageHistory, clearImageHistory, IMAGE_HISTORY_COOKIE_LIMIT } from '../lib/imageHistoryCookie'

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function HistoryItem({ entry, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(entry)}
      className="flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white/70 p-3 text-left shadow-sm transition hover:border-brand-400 hover:bg-brand-50/70 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-brand-300"
    >
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{entry.prompt || 'Saved image'}</span>
      {entry.timestamp ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">{formatTimestamp(entry.timestamp)}</span>
      ) : null}
    </button>
  )
}

export default function ImageGeneratorPage({ experience }) {
  const [prompt, setPrompt] = useState('train speeding through a neon cyberpunk tunnel')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    setHistory(readImageHistory())
  }, [])

  const apiBaseUrl = experience?.imageApiBaseUrl || 'https://groq-endpoint.louispaulet13.workers.dev'

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      setError('Please provide a prompt before generating an image.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const requestUrl = new URL(`${apiBaseUrl.replace(/\/$/, '')}/flux/${encodeURIComponent(trimmedPrompt)}`)
      const response = await fetch(requestUrl.toString())
      if (!response.ok) {
        throw new Error(`Generation failed with status ${response.status}`)
      }
      const payload = await response.json()
      const images = Array.isArray(payload?.images) ? payload.images : []
      if (images.length === 0 || !images[0]?.url) {
        throw new Error('The service did not return an image URL.')
      }

      const normalizedPrompt = typeof payload.prompt === 'string' && payload.prompt.trim() ? payload.prompt.trim() : trimmedPrompt
      const nextResult = {
        prompt: normalizedPrompt,
        images: images.map((image, index) => ({
          url: image?.url || '',
          index: typeof image?.index === 'number' ? image.index : index,
        })),
        raw: payload,
      }

      setResult(nextResult)

      const createdAt = Date.now()
      const newEntries = nextResult.images
        .filter((image) => image?.url)
        .map((image, index) => ({
          prompt: normalizedPrompt,
          url: image.url,
          timestamp: createdAt + index,
        }))

      const existingWithoutDuplicates = history.filter(
        (item) => !newEntries.some((entry) => entry.url === item.url),
      )
      const nextHistory = [...newEntries, ...existingWithoutDuplicates].slice(0, IMAGE_HISTORY_COOKIE_LIMIT)
      setHistory(nextHistory)
      writeImageHistory(nextHistory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error during generation.')
    } finally {
      setLoading(false)
    }
  }

  function handleSelectHistory(entry) {
    if (!entry?.url) return
    setPrompt(entry.prompt || '')
    setResult({
      prompt: entry.prompt,
      images: [{ url: entry.url, index: 0 }],
      raw: null,
    })
  }

  function handleClearHistory() {
    clearImageHistory()
    setHistory([])
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
        >
          <div>
            <label htmlFor="imagegen-prompt" className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200">
              Image prompt
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">Flux @ Groq endpoint</span>
            </label>
            <textarea
              id="imagegen-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Describe the image you want to see..."
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              The request is sent to <code className="rounded bg-slate-100 px-1 py-0.5 text-[0.7rem] text-slate-700 dark:bg-slate-800 dark:text-slate-200">{`${apiBaseUrl}/flux/<prompt>`}</code>. We&apos;ll display the first image from the response.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-brand-400 dark:focus-visible:ring-offset-slate-900"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generating…' : 'Generate image'}
            </button>
            <Link
              to="/imagegen/gallery"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-brand-400 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            >
              View gallery
            </Link>
            {history.length > 0 ? (
              <button
                type="button"
                onClick={handleClearHistory}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-red-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-red-400 dark:hover:text-red-300 dark:focus-visible:ring-offset-slate-900"
              >
                <TrashIcon className="h-4 w-4" />
                Clear saved images
              </button>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
              {error}
            </div>
          ) : null}
        </form>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
              Latest result
            </div>
            <div className="flex flex-col gap-4 p-4">
              {result ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">{result.prompt}</h3>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                    <img src={result.images[0].url} alt={result.prompt} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <a
                    href={result.images[0].url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  >
                    Open image in new tab
                  </a>
                </>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Submit a prompt to generate your first image. Your results will appear here.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
              Saved images (browser cookie)
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {history.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Generate an image to automatically store the image URL, prompt, and timestamp in a browser cookie for quick acce
ss.
                </p>
              ) : (
                history.map((entry) => (
                  <HistoryItem key={`${entry.url}-${entry.timestamp}`} entry={entry} onSelect={handleSelectHistory} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
